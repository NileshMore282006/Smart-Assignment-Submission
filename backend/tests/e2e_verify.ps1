Write-Host "=== 1. TEACHER AUTHENTICATION ==="
$teaLogin = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"teacher@demo.com","password":"Teacher123!"}'
Write-Host "Logged in as:" $teaLogin.user.full_name "Role:" $teaLogin.user.role

Write-Host "`n=== 2. TEACHER CREATES ASSIGNMENT ==="
$teaHeaders = @{ "Authorization" = "Bearer " + $teaLogin.token }
$asgBody = @{
    title = "Distributed Cloud Storage and Sharding Lab"
    subject = "Cloud Computing"
    course_code = "CS-601"
    description = "Implement a fault-tolerant object store with multi-AZ replication."
    instructions = "Format using standard IEEE conference template."
    due_date = (Get-Date).AddDays(14).ToString("yyyy-MM-ddTHH:mm:ss")
    max_marks = 100
    allowed_file_types = @("PDF", "DOCX")
    max_file_size_mb = 15
    status = "published"
} | ConvertTo-Json

$createdAsg = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/assignments" -Method Post -Headers $teaHeaders -ContentType "application/json" -Body $asgBody
Write-Host "Created Assignment ID:" $createdAsg.assignment.id "Title:" $createdAsg.assignment.title

Write-Host "`n=== 3. STUDENT AUTHENTICATION ==="
$stuLogin = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"student@demo.com","password":"Student123!"}'
Write-Host "Logged in as:" $stuLogin.user.full_name "Role:" $stuLogin.user.role

Write-Host "`n=== 4. STUDENT FETCHES PUBLISHED ASSIGNMENTS ==="
$stuHeaders = @{ "Authorization" = "Bearer " + $stuLogin.token }
$stuAsgs = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/assignments" -Headers $stuHeaders
Write-Host "Total published assignments visible to student:" $stuAsgs.total
$found = $stuAsgs.assignments | Where-Object { $_.title -like "*Distributed Cloud Storage*" }
if ($found) {
    Write-Host "SUCCESS: Student found newly created assignment ID:" $found.id "Title:" $found.title
} else {
    Write-Host "ERROR: Assignment not found in student list"
}

Write-Host "`n=== 5. SECURITY: STUDENT ATTEMPTS UNAUTHORIZED TEACHER ACTION ==="
try {
    $hackBody = '{"title":"Tampered Title"}'
    Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/assignments/$($found.id)" -Method Put -Headers $stuHeaders -ContentType "application/json" -Body $hackBody
    Write-Host "FAILED: Unauthorized action was not blocked!"
} catch {
    Write-Host "SUCCESS: Blocked unauthorized student mutation! HTTP Status Code:" $_.Exception.Response.StatusCode.value__
}

Write-Host "`n=== 6. VERIFY SESSION RESTORATION VIA /api/auth/me ==="
$me = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/me" -Headers $stuHeaders
Write-Host "Verified current session user:" $me.user.full_name "Email:" $me.user.email

Write-Host "`n=== 7. LOGOUT ==="
$logout = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/logout" -Method Post -Headers $stuHeaders
Write-Host "Logout response:" $logout.message
