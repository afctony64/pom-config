"""
Post-processor for cleaning entityName values from LLM output.
Strips web title patterns like "Company | Tagline" → "Company"
"""
import re

SEPARATORS = [" | ", " - ", " :: ", " – ", " — "]


def clean_entity_name(name: str, domain: str = "") -> str:
    """
    Clean an entityName by stripping taglines and marketing text.

    Examples:
        "Boomi | Connect everything..." → "Boomi"
        "Acme Corp - Leading Provider" → "Acme Corp"
        "Home" → "" (invalid, should be extracted from content)
    """
    if not name:
        return name

    # Strip separators and take the first part
    for sep in SEPARATORS:
        if sep in name:
            name = name.split(sep)[0].strip()
            break

    # Also handle single character separators at the end
    name = re.sub(r"\s*[|–—]\s*.*$", "", name).strip()

    # Remove trademark symbols at the end
    name = re.sub(r"[™®©]+$", "", name).strip()

    # If result is just the domain or generic, return empty to trigger re-extraction
    generic_names = [
        "home",
        "welcome",
        "official",
        "please",
        "error",
        "404",
        "not found",
    ]
    if name.lower() in generic_names:
        return ""
    if domain and name.lower() == domain.lower():
        return ""

    return name


if __name__ == "__main__":
    # Test cases
    tests = [
        ("Boomi | Connect everything to achieve anything.™", "boomi.com", "Boomi"),
        ("Acme Corp - The Leading Provider", "acme.com", "Acme Corp"),
        ("Company :: Welcome", "company.com", "Company"),
        ("QCommission", "qcommission.com", "QCommission"),
        ("Home", "example.com", ""),
        ("example.com", "example.com", ""),
    ]

    for input_val, domain, expected in tests:
        result = clean_entity_name(input_val, domain)
        status = "✅" if result == expected else "❌"
        print(f"{status} '{input_val}' → '{result}' (expected: '{expected}')")
