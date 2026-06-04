import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from ml.hospital import HospitalRanker

def test_returns_hospital_ranking():
    r = HospitalRanker()
    ranking = r.get_ranking()
    assert len(ranking) > 0
    assert "hospital_id" in ranking[0]
    assert "avg_risk_score" in ranking[0]
    assert "claim_count" in ranking[0]

def test_sorted_descending():
    r = HospitalRanker()
    ranking = r.get_ranking()
    scores = [h["avg_risk_score"] for h in ranking]
    assert scores == sorted(scores, reverse=True)

def test_top_n():
    r = HospitalRanker()
    top10 = r.get_ranking(limit=10)
    assert len(top10) == 10

def test_singleton_same_instance():
    assert HospitalRanker() is HospitalRanker()
