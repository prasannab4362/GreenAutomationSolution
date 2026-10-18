<?php
/**
 * Green Automation Solution — contact.php
 * Server-side form processing with CSRF protection, validation, and spam prevention.
 *
 * SETUP INSTRUCTIONS:
 * 1. Copy config.example.php to config.php and fill in your real values.
 * 2. Upload to your cPanel hosting (PHP 7.4+).
 * 3. Ensure the /logs/ directory is created and writable (chmod 755).
 */

declare(strict_types=1);

/* ----------------------------------------------------------------
   Only accept AJAX / POST requests
   ---------------------------------------------------------------- */
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
    http_response_code(405);
    exit('Method Not Allowed');
}

header('Content-Type: application/json; charset=utf-8');

/* ----------------------------------------------------------------
   Load config
   ---------------------------------------------------------------- */
$configFile = __DIR__ . '/config.php';
if (!file_exists($configFile)) {
    echo json_encode(['success' => false, 'message' => 'Server configuration missing. Contact the administrator.']);
    exit;
}
$config = require $configFile;

/* ----------------------------------------------------------------
   Session & CSRF
   ---------------------------------------------------------------- */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

function generateCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrfToken(string $token): bool {
    return isset($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

// Validate CSRF (skip in test/debug mode)
$csrfInput = trim($_POST['csrf_token'] ?? '');
if (!($config['debug_skip_csrf'] ?? false)) {
    if (!verifyCsrfToken($csrfInput)) {
        echo json_encode(['success' => false, 'message' => 'Security token mismatch. Please refresh the page and try again.']);
        exit;
    }
}

/* ----------------------------------------------------------------
   Rate limiting (file-based)
   ---------------------------------------------------------------- */
function checkRateLimit(string $ip, string $logsDir, int $maxRequests = 5, int $window = 900): bool {
    if (!is_dir($logsDir)) {
        @mkdir($logsDir, 0755, true);
    }
    $file = $logsDir . '/rl_' . md5($ip) . '.json';
    $data = file_exists($file) ? json_decode(file_get_contents($file), true) : ['count' => 0, 'reset_at' => time() + $window];

    if (time() > $data['reset_at']) {
        $data = ['count' => 0, 'reset_at' => time() + $window];
    }

    if ($data['count'] >= $maxRequests) {
        return false;
    }

    $data['count']++;
    file_put_contents($file, json_encode($data), LOCK_EX);
    return true;
}

$logsDir = __DIR__ . '/logs';
$ip = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'];

if (!checkRateLimit($ip, $logsDir)) {
    echo json_encode(['success' => false, 'message' => 'Too many requests. Please wait a few minutes before trying again.']);
    exit;
}

/* ----------------------------------------------------------------
   Sanitize & Validate Inputs
   ---------------------------------------------------------------- */
function sanitize(string $input): string {
    return htmlspecialchars(strip_tags(trim($input)), ENT_QUOTES, 'UTF-8');
}

function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

function validatePhone(string $phone): bool {
    return preg_match('/^\+?[\d\s\-]{7,15}$/', $phone) === 1;
}

$fullName     = sanitize($_POST['full-name']    ?? '');
$company      = sanitize($_POST['company']      ?? '');
$email        = sanitize($_POST['email']        ?? '');
$phone        = sanitize($_POST['phone']        ?? '');
$service      = sanitize($_POST['service']      ?? '');
$location     = sanitize($_POST['location']     ?? '');
$requirements = sanitize($_POST['requirements'] ?? '');
$honeypot     = trim($_POST['website'] ?? ''); // Honeypot field

$errors = [];

// Honeypot spam check
if (!empty($honeypot)) {
    // Silently reject bots
    echo json_encode(['success' => true]);
    exit;
}

if (strlen($fullName) < 2)                         $errors[] = 'Full name is required.';
if (!validateEmail($email))                         $errors[] = 'A valid email address is required.';
if (!validatePhone($phone))                         $errors[] = 'A valid phone number is required.';
if (empty($service))                                $errors[] = 'Please select the service required.';
if (strlen($location) < 2)                         $errors[] = 'Location is required.';
if (strlen($requirements) < 10)                    $errors[] = 'Please provide more detail about your requirements.';
if (strlen($fullName) > 100)                       $errors[] = 'Name is too long.';
if (strlen($requirements) > 2000)                  $errors[] = 'Requirements text is too long (max 2000 characters).';

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

/* ----------------------------------------------------------------
   Allowed services list (whitelist)
   ---------------------------------------------------------------- */
$allowedServices = [
    'cctv-surveillance',
    'home-automation-iot',
    'robotics-ai-edtech',
    'smart-agriculture',
    'industrial-iot',
    'general-enquiry',
];

if (!in_array($service, $allowedServices, true)) {
    echo json_encode(['success' => false, 'message' => 'Invalid service selection.']);
    exit;
}

$serviceLabels = [
    'cctv-surveillance'    => 'CCTV Surveillance Services & Sales',
    'home-automation-iot'  => 'Home Automation & IoT',
    'robotics-ai-edtech'   => 'Robotics & AI EdTech',
    'smart-agriculture'    => 'Smart Agriculture & Agricultural Automation',
    'industrial-iot'       => 'Industrial IoT & Automation',
    'general-enquiry'      => 'General Enquiry',
];

$serviceLabel = $serviceLabels[$service] ?? $service;

/* ----------------------------------------------------------------
   Compose Email
   ---------------------------------------------------------------- */
$recipientEmail = $config['recipient_email'];
$senderName     = $config['sender_name'] ?? 'Green Automation Solution Website';
$senderEmail    = $config['sender_email'] ?? 'noreply@' . ($_SERVER['HTTP_HOST'] ?? 'greenautomationsolution.com');

$subject = "[Enquiry] {$serviceLabel} – {$fullName}";

$body = <<<EOT
New enquiry received from the Green Automation Solution website.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CONTACT DETAILS
  Full Name   : {$fullName}
  Company     : {$company}
  Email       : {$email}
  Phone       : {$phone}
  Location    : {$location}

ENQUIRY DETAILS
  Service     : {$serviceLabel}
  Requirements:
{$requirements}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Submitted at : {$_SERVER['REQUEST_TIME_FLOAT']} UTC
IP Address   : {$ip}
User-Agent   : {$_SERVER['HTTP_USER_AGENT']}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This message was generated automatically by the Green Automation Solution website contact form.
EOT;

$headers  = "From: {$senderName} <{$senderEmail}>\r\n";
$headers .= "Reply-To: {$fullName} <{$email}>\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

/* ----------------------------------------------------------------
   Send Email
   ---------------------------------------------------------------- */
$sent = mail($recipientEmail, $subject, $body, $headers);

/* ----------------------------------------------------------------
   Auto-Reply to Enquirer
   ---------------------------------------------------------------- */
if ($sent && ($config['send_auto_reply'] ?? true)) {
    $autoReplySubject = "We received your enquiry – Green Automation Solution";
    $autoReplyBody = <<<EOT
Dear {$fullName},

Thank you for contacting Green Automation Solution.

We have received your enquiry regarding: {$serviceLabel}

Our team will review your requirements and get back to you within 1–2 business days.

If your matter is urgent, please contact us directly:
  Phone : {$config['phone']}
  WhatsApp : {$config['whatsapp']}
  Email : {$config['recipient_email']}

Your Reference:
  Service   : {$serviceLabel}
  Location  : {$location}

Warm regards,
Green Automation Solution
{$config['address']}
EOT;

    $autoReplyHeaders  = "From: {$senderName} <{$recipientEmail}>\r\n";
    $autoReplyHeaders .= "MIME-Version: 1.0\r\n";
    $autoReplyHeaders .= "Content-Type: text/plain; charset=UTF-8\r\n";

    mail($email, $autoReplySubject, $autoReplyBody, $autoReplyHeaders);
}

/* ----------------------------------------------------------------
   Log submission
   ---------------------------------------------------------------- */
$logEntry = json_encode([
    'timestamp'  => date('c'),
    'ip'         => $ip,
    'name'       => $fullName,
    'email'      => $email,
    'service'    => $serviceLabel,
    'location'   => $location,
    'mail_sent'  => $sent,
]) . "\n";

@file_put_contents($logsDir . '/enquiries.log', $logEntry, FILE_APPEND | LOCK_EX);

/* ----------------------------------------------------------------
   Regenerate CSRF token after successful submission
   ---------------------------------------------------------------- */
unset($_SESSION['csrf_token']);

/* ----------------------------------------------------------------
   Response
   ---------------------------------------------------------------- */
if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => 'Thank you! Your enquiry has been received. We will contact you within 1-2 business days.',
    ]);
} else {
    // Log mail failure
    error_log("[GAS] mail() failed for enquiry from {$email}");
    echo json_encode([
        'success' => false,
        'message' => 'We could not process your enquiry at this time. Please email us directly or contact via WhatsApp.',
    ]);
}
