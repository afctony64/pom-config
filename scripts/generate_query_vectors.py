#!/usr/bin/env python3
"""
Generate Pre-computed Query Vectors for Researcher AI

Reads search_queries from all researcher_ai/*.yaml configs and generates
vector embeddings using the same transformers service as Weaviate's Page_facts.

Output: researcher_ai/query_vectors.json

Usage:
    # From PomSpark container (has access to transformers-lb)
    docker exec pomai-backend-spark python /app/.pom_config_pkg/scripts/generate_query_vectors.py

    # Or directly with transformers URL
    TRANSFORMERS_URL=http://spark-65d6.local:8093 python generate_query_vectors.py

Benefits:
    - One-time embedding cost (run once, reuse forever)
    - Zero runtime embedding for page facts injection
    - Reduces Weaviate load by ~80% (vector search vs hybrid)
    - Vectors tracked in version control
"""

import asyncio
import json
import os
import sys
from pathlib import Path

import httpx
import yaml


async def get_embeddings(
    texts: list[str],
    transformer_url: str,
    timeout: float = 60.0,
) -> list[list[float]]:
    """Get embeddings from transformers service."""
    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            f"{transformer_url}/vectors/batch",
            json={"texts": texts},
        )
        response.raise_for_status()
        data = response.json()
        return data.get("vectors", data.get("embeddings", []))


async def main():
    # Find researcher_ai directory
    script_dir = Path(__file__).parent
    researcher_ai_dir = script_dir.parent / "researcher_ai"

    if not researcher_ai_dir.exists():
        print(f"❌ researcher_ai directory not found: {researcher_ai_dir}")
        sys.exit(1)

    # Get transformers URL
    transformer_url = os.getenv(
        "TRANSFORMERS_URL",
        os.getenv("TRANSFORMERS_INFERENCE_API", "http://transformers-lb:80"),
    )
    print(f"📡 Using transformers service: {transformer_url}")

    # Collect all queries from all researcher configs
    all_queries: dict[str, list[str]] = {}

    for yaml_file in sorted(researcher_ai_dir.glob("*.yaml")):
        if yaml_file.name == "query_vectors.json":
            continue

        with open(yaml_file) as f:
            config = yaml.safe_load(f)

        researcher_id = config.get("id") or yaml_file.stem.replace("_ai", "")
        queries = config.get("search_queries", [])

        # Also check legacy search_query (single string)
        if not queries and config.get("search_query"):
            queries = [config["search_query"]]

        if queries:
            all_queries[researcher_id] = queries
            print(f"  📋 {researcher_id}: {len(queries)} queries")

    print(
        f"\n📊 Total: {sum(len(q) for q in all_queries.values())} queries across {len(all_queries)} researchers"
    )

    # Flatten for batch embedding
    flat_queries: list[tuple[str, int, str]] = []  # (researcher_id, index, text)
    for researcher_id, queries in all_queries.items():
        for i, query in enumerate(queries):
            flat_queries.append((researcher_id, i, query))

    # Get embeddings in one batch
    print("\n🔄 Generating embeddings...")
    texts = [q[2] for q in flat_queries]

    try:
        embeddings = await get_embeddings(texts, transformer_url)
    except Exception as e:
        print(f"❌ Failed to get embeddings: {e}")
        print(f"   Make sure transformers service is running at {transformer_url}")
        sys.exit(1)

    if len(embeddings) != len(texts):
        print(
            f"❌ Embedding count mismatch: got {len(embeddings)}, expected {len(texts)}"
        )
        sys.exit(1)

    # Verify vector dimensions
    if embeddings:
        dim = len(embeddings[0])
        print(f"✅ Vector dimensions: {dim}")
        if dim != 1024:
            print(
                f"⚠️  Warning: Expected 1024 dimensions (Snowflake arctic-embed-l), got {dim}"
            )
            print("   Make sure you're using the same model as Page_facts collection")

    # Reconstruct into structured format
    result: dict[str, list[dict]] = {}
    for (researcher_id, idx, text), vector in zip(flat_queries, embeddings):
        if researcher_id not in result:
            result[researcher_id] = []
        result[researcher_id].append(
            {
                "text": text,
                "vector": vector,
            }
        )

    # Add metadata
    output = {
        "_metadata": {
            "generated_at": __import__("datetime").datetime.now().isoformat(),
            "transformer_url": transformer_url,
            "vector_dimensions": len(embeddings[0]) if embeddings else 0,
            "total_queries": len(flat_queries),
            "researchers": list(result.keys()),
        },
        "queries": result,
    }

    # Write output
    output_path = researcher_ai_dir / "query_vectors.json"
    with open(output_path, "w") as f:
        json.dump(output, f, indent=2)

    print(f"\n✅ Saved to: {output_path}")
    print(f"   Size: {output_path.stat().st_size / 1024:.1f} KB")

    # Summary
    print("\n📋 Summary by researcher:")
    for researcher_id, queries in result.items():
        print(f"   {researcher_id}: {len(queries)} queries")


if __name__ == "__main__":
    asyncio.run(main())
