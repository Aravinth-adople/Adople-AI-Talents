import requests
from pathlib import Path

def test_batch_upload():
    url = "http://127.0.0.1:8000/api/upload"
    
    # Pick 2 sample resumes
    files_to_upload = list(Path("cleaned_resumes").glob("*.pdf"))[:2]
    print(f"Testing upload of {len(files_to_upload)} files...")
    
    upload_data = []
    file_handles = []
    for f in files_to_upload:
        fh = open(f, "rb")
        file_handles.append(fh)
        upload_data.append(("files", (f"UPLOAD_TEST_{f.name}", fh, "application/pdf")))
        
    try:
        res = requests.post(url, files=upload_data, data={"active_jd_id": "ai-engineer"})
        print("Status code:", res.status_code)
        resp_json = res.json()
        print("Response:", {
            "total_uploaded": resp_json.get("total_uploaded"),
            "successful_count": resp_json.get("successful_count"),
            "error_count": resp_json.get("error_count"),
            "first_result": resp_json.get("results", [])[0] if resp_json.get("results") else None
        })
    finally:
        for fh in file_handles:
            fh.close()

if __name__ == "__main__":
    test_batch_upload()
