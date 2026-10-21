Write-Host "=== 1. STUDENT REGISTRATION ==="
$regBody = @{
    full_name = "Sarah Chen"
    email = "sarah.chen@demo.com"
    student_id = "CS-2024-9902"
    password = "Student123!"
    role = "student"
} | ConvertTo-Json

try {
    $regResp = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/register" -Method Post -ContentType "application/json" -Body $regBody
    Write-Host "Registered new student:" $regResp.user.full_name "Email:" $regResp.user.email
} catch {
    Write-Host "Account might already exist, proceeding to login."
}

Write-Host "`n=== 2. STUDENT LOGIN ==="
$loginResp = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"sarah.chen@demo.com","password":"Student123!"}'
Write-Host "Logged in successfully:" $loginResp.user.full_name "Token received:" ($loginResp.token -ne $null)

Write-Host "`n=== 3. STUDENT SUBMITS COURSEWORK ==="
$headers = @{ "Authorization" = "Bearer " + $loginResp.token }
$subBody = @{
    filename = "Sarah_Chen_Distributed_Storage_Report.pdf"
    file_size_bytes = 1024 * 1024 * 3
} | ConvertTo-Json

$subResp = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/submissions/assignments/4/submit" -Method Post -Headers $headers -ContentType "application/json" -Body $subBody
Write-Host "Created submission record ID:" $subResp.submission.id "File:" $subResp.submission.original_filename "Storage Provider:" $subResp.submission.storage_provider

Write-Host "`n=== 4. TEACHER REVIEWS SUBMISSION ==="
$teaLogin = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/auth/login" -Method Post -ContentType "application/json" -Body '{"email":"teacher@demo.com","password":"Teacher123!"}'
$teaHeaders = @{ "Authorization" = "Bearer " + $teaLogin.token }

$reviewBody = @{
    review_status = "reviewed"
    teacher_notes = "Excellent partition tolerance analysis and RAFT consensus model."
} | ConvertTo-Json

$reviewResp = Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/submissions/$($subResp.submission.id)/review" -Method Put -Headers $teaHeaders -ContentType "application/json" -Body $reviewBody
Write-Host "Review status updated to:" $reviewResp.submission.review_status "Notes:" $reviewResp.submission.teacher_notes
