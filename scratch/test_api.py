import urllib.request
import json

def test():
    # 1. Top for AI Engineer
    res = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/candidates?active_jd_id=ai-engineer&sort_by=score&sort_order=desc&page_size=5").read().decode())
    print("=== TOP CANDIDATES FOR AI ENGINEER ===")
    for c in res["candidates"]:
        print(f" - {c['name']} ({c['passout_year']} batch) | Score: {c['active_score']}% | Category: {c['primary_category']} | Skills: {c['skills'][:6]}")

    # 2. Top for Full Stack Java
    res2 = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/candidates?active_jd_id=full-stack-java&sort_by=score&sort_order=desc&page_size=5").read().decode())
    print("\n=== TOP CANDIDATES FOR FULL STACK JAVA ===")
    for c in res2["candidates"]:
        print(f" - {c['name']} ({c['passout_year']} batch) | Score: {c['active_score']}% | Category: {c['primary_category']} | Skills: {c['skills'][:6]}")

    # 3. Top for AR Caller
    res3 = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/candidates?active_jd_id=ar-caller&sort_by=score&sort_order=desc&page_size=5").read().decode())
    print("\n=== TOP CANDIDATES FOR AR CALLER ===")
    for c in res3["candidates"]:
        print(f" - {c['name']} ({c['passout_year']} batch) | Score: {c['active_score']}% | Category: {c['primary_category']} | Skills: {c['skills'][:6]}")

    # 4. Top for Business Development
    res4 = json.loads(urllib.request.urlopen("http://127.0.0.1:8000/api/candidates?active_jd_id=us-bd-sales&sort_by=score&sort_order=desc&page_size=5").read().decode())
    print("\n=== TOP CANDIDATES FOR US BD SALES ===")
    for c in res4["candidates"]:
        print(f" - {c['name']} ({c['passout_year']} batch) | Score: {c['active_score']}% | Category: {c['primary_category']} | Skills: {c['skills'][:6]}")

if __name__ == "__main__":
    test()
