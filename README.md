<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GUL Dashboard</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- Time and Date Section -->
        <div class="time" id="time">12:00 PM</div>
        <div class="date" id="date">Monday, January 1, 2024</div>

        <!-- Greeting and Quote -->
        <div class="greeting" id="greeting">Hello, User!</div>
        <div class="quote" id="quote">Loading your daily motivation...</div>

        <!-- Search Bar -->
        <div class="search-container">
            <form action="https://www.google.com/search" method="GET" target="_blank">
                <input type="text" name="q" class="search-bar" placeholder="Search Google..." autocomplete="off">
            </form>
        </div>

        <!-- Quick Links -->
        <div class="links-container">
            <h3>Quick Links</h3>
            <div class="links-grid">
                <a href="https://gmail.com" target="_blank" class="link-item">Gmail</a>
                <a href="https://youtube.com" target="_blank" class="link-item">YouTube</a>
                <a href="https://github.com" target="_blank" class="link-item">GitHub</a>
                <a href="https://drive.google.com" target="_blank" class="link-item">Drive</a>
                <!-- Add more links as you wish -->
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>
