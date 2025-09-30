import unittest
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


class IdCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
        self.sources = []
        self.buttons = []

    def handle_starttag(self, tag, attrs):
        attr_dict = dict(attrs)
        if "id" in attr_dict:
            self.ids.add(attr_dict["id"])
        if tag == "script" and "src" in attr_dict:
            self.scripts.append(attr_dict["src"])
        if tag == "source" and "src" in attr_dict:
            self.sources.append(attr_dict["src"])
        if tag == "button":
            self.buttons.append(attr_dict.get("id", ""))


class TestSiteStructure(unittest.TestCase):
    def setUp(self):
        self.index_path = ROOT / "index.html"
        self.script_path = ROOT / "script.js"
        self.style_path = ROOT / "style.css"
        self.video_path = ROOT / "Logic_of_the_Silent_Conveyor.mp4"
        self.index_html = self.index_path.read_text(encoding="utf-8")
        parser = IdCollector()
        parser.feed(self.index_html)
        self.parser = parser

    def test_required_files_exist(self):
        self.assertTrue(self.index_path.exists(), "index.html is missing")
        self.assertTrue(self.script_path.exists(), "script.js is missing")
        self.assertTrue(self.style_path.exists(), "style.css is missing")
        self.assertTrue(self.video_path.exists(), "Training video is missing")

    def test_html_references_assets(self):
        self.assertIn("script.js", self.parser.scripts, "index.html should reference script.js")
        self.assertIn("style.css", self.index_html, "index.html should include the stylesheet")
        self.assertIn("Logic_of_the_Silent_Conveyor.mp4", self.parser.sources, "Video source not referenced")

    def test_core_controls_present(self):
        required_ids = {
            "panel-container",
            "startButton",
            "newScenarioButton",
            "feedback",
            "trainingVideo",
            "playbackRateSelector",
        }
        missing = required_ids.difference(self.parser.ids)
        self.assertFalse(missing, f"Missing expected element ids: {sorted(missing)}")

    def test_expected_buttons(self):
        self.assertIn("startButton", self.parser.buttons)
        self.assertIn("newScenarioButton", self.parser.buttons)

    def test_script_configuration(self):
        script_content = self.script_path.read_text(encoding="utf-8")
        self.assertIn("const NUM_CHILDREN = 15", script_content)
        self.assertIn("function initGame()", script_content)
        self.assertIn("function startSimulation()", script_content)
        self.assertIn("function provideFeedback(index)", script_content)

    def test_style_definitions(self):
        style_content = self.style_path.read_text(encoding="utf-8")
        self.assertIn(".panel", style_content)
        self.assertIn(".panel-container", style_content)
        self.assertIn(".feedback", style_content)


if __name__ == "__main__":
    unittest.main()
