#!/usr/bin/env python3
import sys
import unittest
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[2]))

from hooks.block_root_markdown import is_blocked


class TestBlockRootMarkdown(unittest.TestCase):
    def test_allows_allowlisted_root(self) -> None:
        self.assertFalse(is_blocked("README.md"))
        self.assertFalse(is_blocked("CHANGELOG.md"))

    def test_blocks_unlisted_root(self) -> None:
        self.assertTrue(is_blocked("NEW_GUIDE.md"))

    def test_allows_non_root_paths(self) -> None:
        self.assertFalse(is_blocked("docs/NEW_GUIDE.md"))
        self.assertFalse(is_blocked("schemas/README.md"))

    def test_ignores_non_markdown(self) -> None:
        self.assertFalse(is_blocked("README.txt"))


if __name__ == "__main__":
    unittest.main()
