import urllib.request
import urllib.error
import json

BASE = "http://127.0.0.1:8000"

def api(method, path, token=None, data=None):
    url = f"{BASE}{path}"
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    body = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode("utf-8")
            return status, json.loads(content) if content else None
    except urllib.error.HTTPError as e:
        content = e.read().decode("utf-8")
        try:
            err_json = json.loads(content)
        except Exception:
            err_json = content
        return e.code, err_json

def login(email, password="campus123"):
    st, res = api("POST", "/api/auth/login", data={"email": email, "password": password})
    assert st == 200, f"Login failed for {email}: {res}"
    return res["token"], res["user"]

def run_tests():
    print("================ RUNNING SECURITY TESTS ================")
    
    # Register/Login Harini (Student A)
    harini_email = "harini.student@university.edu"
    st, reg = api("POST", "/api/auth/register", data={
        "full_name": "Harini Tallapalli",
        "email": harini_email,
        "password": "campus123",
        "student_id": "STU-2024-888",
        "department": "Computer Science",
        "year": 3,
        "semester": 5
    })
    if st == 200 or st == 201:
        harini_token = reg["token"]
    else:
        harini_token, _ = login(harini_email, "campus123")
    print("[PASS] Harini (Student A) authenticated.")

    # Login Alex Johnson (Student B)
    alex_token, _ = login("alex.johnson@university.edu", "campus123")
    print("[PASS] Alex Johnson (Student B) authenticated.")

    # Login Teacher (Dr. K. Sharma)
    teacher_token, _ = login("sharma@university.edu", "campus123")
    print("[PASS] Dr. K. Sharma (Teacher) authenticated.")

    # ─────────────────────────────────────────────────────────────
    # TEST A: Login as Harini. Create: "My Python Practice" in My Study Resources.
    # Expected: Saved successfully.
    st, res_a = api("POST", "/api/me/resources", token=harini_token, data={
        "title": "My Python Practice",
        "subject": "Python",
        "resource_type": "link",
        "description": "Daily LeetCode and algorithmic problem solving practice.",
        "url": "https://leetcode.com"
    })
    assert st == 201, f"TEST A FAILED: status {st}, {res_a}"
    harini_resource_id = res_a["id"]
    print(f"[TEST A PASSED] Harini personal resource created successfully. ID: {harini_resource_id}")

    # ─────────────────────────────────────────────────────────────
    # TEST B: Login as another student (Alex).
    # Attempt to access Harini's personal resource by changing resource ID/API request.
    # Expected: 403 or 404. Harini's resource content must not be returned.
    st, res_b_get = api("GET", f"/api/me/resources/{harini_resource_id}", token=alex_token)
    assert st in (403, 404), f"TEST B FAILED: expected 403 or 404, got {st}: {res_b_get}"
    
    st, res_b_put = api("PUT", f"/api/me/resources/{harini_resource_id}", token=alex_token, data={"title": "Hacked Title"})
    assert st in (403, 404), f"TEST B PUT FAILED: expected 403 or 404, got {st}: {res_b_put}"

    st, res_b_del = api("DELETE", f"/api/me/resources/{harini_resource_id}", token=alex_token)
    assert st in (403, 404), f"TEST B DELETE FAILED: expected 403 or 404, got {st}: {res_b_del}"
    print(f"[TEST B PASSED] Other student (Alex) cannot GET, PUT, or DELETE Harini's personal resource (Status: {st}).")

    # ─────────────────────────────────────────────────────────────
    # TEST C: Login as Teacher. Attempt to access Harini's personal study resource.
    # Expected: Forbidden/not available (403). The resource must NOT appear anywhere in Teacher Portal.
    st, res_c_me = api("GET", "/api/me/resources", token=teacher_token)
    assert st == 403, f"TEST C FAILED: teacher calling /api/me/resources should be 403, got {st}: {res_c_me}"

    st, res_c_item = api("GET", f"/api/me/resources/{harini_resource_id}", token=teacher_token)
    assert st == 403, f"TEST C FAILED: teacher calling /api/me/resources/{{id}} should be 403, got {st}: {res_c_item}"

    # Also verify that /api/faculty-resources does NOT contain Harini's personal resource
    st, res_c_fac = api("GET", "/api/faculty-resources", token=teacher_token)
    assert st == 200
    for r in res_c_fac:
        assert r["title"] != "My Python Practice", "TEST C FAILED: Personal resource leaked in faculty resources!"
    print(f"[TEST C PASSED] Teacher cannot access personal resources (Status: {st}) and it does NOT appear in Teacher Portal.")

    # ─────────────────────────────────────────────────────────────
    # TEST D: Teacher creates: "Operating Systems — Process Scheduling Reference" as a Faculty Resource.
    # Expected: Teacher can edit/delete it.
    st, res_d_create = api("POST", "/api/faculty-resources", token=teacher_token, data={
        "title": "Operating Systems — Process Scheduling Reference",
        "resource_type": "link",
        "description": "Comprehensive reference on round-robin and priority scheduling.",
        "url": "https://en.wikipedia.org/wiki/Scheduling_(computing)"
    })
    assert st == 201, f"TEST D CREATE FAILED: {st}, {res_d_create}"
    fac_id = res_d_create["id"]

    # Teacher edits it
    st, res_d_edit = api("PUT", f"/api/faculty-resources/{fac_id}", token=teacher_token, data={
        "description": "Updated reference description."
    })
    assert st == 200, f"TEST D EDIT FAILED: {st}, {res_d_edit}"
    print(f"[TEST D PASSED] Teacher created and edited Faculty Resource. ID: {fac_id}")

    # ─────────────────────────────────────────────────────────────
    # TEST E: Login as enrolled student (Alex or Harini).
    # Expected: Resource appears under Faculty Resources. Student can open/view it. Student cannot edit/delete it.
    st, res_e_list = api("GET", "/api/faculty-resources", token=harini_token)
    assert st == 200
    matched = [r for r in res_e_list if r["id"] == fac_id]
    assert len(matched) == 1, "TEST E FAILED: Faculty resource not found in student list!"
    print("[TEST E PASSED] Enrolled student can see and view the Faculty Resource.")

    # ─────────────────────────────────────────────────────────────
    # TEST F: Student attempts direct PUT/DELETE request against Faculty Resource.
    # Expected: 403 Forbidden.
    st, res_f_put = api("PUT", f"/api/faculty-resources/{fac_id}", token=harini_token, data={"title": "Vandalized Title"})
    assert st == 403, f"TEST F PUT FAILED: expected 403, got {st}: {res_f_put}"

    st, res_f_del = api("DELETE", f"/api/faculty-resources/{fac_id}", token=harini_token)
    assert st == 403, f"TEST F DELETE FAILED: expected 403, got {st}: {res_f_del}"
    print("[TEST F PASSED] Student direct PUT and DELETE on Faculty Resource were rejected with 403 Forbidden.")

    print("\n================ ALL SECURITY TESTS PASSED SUCCESSFULLY! ================")

if __name__ == "__main__":
    run_tests()
