<?php
/**
 * Green Automation Solution — config.example.php
 *
 * HOW TO USE:
 * 1. Copy this file to config.php in the same directory.
 * 2. Replace all placeholder values below with real company details.
 * 3. Never commit config.php to a public repository.
 * 4. Add config.php to your .gitignore file.
 */

return [

    /* ---- Contact Details ------------------------------------------ */

    // Primary email where all enquiries are delivered
    'recipient_email'  => 'edadmin@gasai.in',

    // Name shown in the From: header of outgoing emails
    'sender_name'      => 'Green Automation Solution',

    // Reply-to / sender email (should be a valid address on your domain)
    'sender_email'     => 'edadmin@gasai.in',

    // Company phone number (shown in auto-reply emails)
    'phone'            => '+91 95140 07777',

    // WhatsApp number with country code, no spaces or dashes
    // Example: 919876543210 (for India +91 98765 43210)
    'whatsapp'         => '919514007777',

    // Company address (shown in auto-reply emails and footer)
    'address'          => '108, Hospital St, Kurinjipadi, Tamil Nadu 607302',

    // Social media URLs (set to '' to hide)
    'social_facebook'  => 'https://facebook.com/greenautomationsolution',
    'social_instagram' => 'https://instagram.com/greenautomationsolution',
    'social_linkedin'  => 'https://linkedin.com/company/greenautomationsolution',
    'social_youtube'   => 'https://youtube.com/@greenautomationsolution',

    /* ---- Email Settings ------------------------------------------- */

    // Send an automatic acknowledgement reply to the enquirer?
    'send_auto_reply'  => true,

    /* ---- Security & Development ------------------------------------ */

    // Set to true ONLY during local testing when no session is available.
    // MUST be false (or removed) in production.
    'debug_skip_csrf'  => false,

];
