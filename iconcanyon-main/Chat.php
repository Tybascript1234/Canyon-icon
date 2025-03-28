<?php
session_start();

// الاتصال بقاعدة البيانات
$servername = "localhost";
$username = "root"; // قم بتغيير هذا إلى اسم المستخدم الخاص بك
$password = ""; // قم بتغيير هذا إلى كلمة المرور الخاصة بك
$dbname = "chat_app";

try {
    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
    exit();
}

// تسجيل الخروج
if (isset($_GET['logout'])) {
    session_unset();
    session_destroy();
    header('Location: '.$_SERVER['PHP_SELF']);
    exit();
}

// تسجيل المستخدم الجديد
if (isset($_POST['register'])) {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);

    $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (:username, :password)");
    $stmt->bindParam(':username', $username);
    $stmt->bindParam(':password', $password);

    if ($stmt->execute()) {
        header('Location: '.$_SERVER['PHP_SELF'].'?login');
    } else {
        echo "خطأ في إنشاء الحساب!";
    }
}

// تسجيل الدخول
if (isset($_POST['login'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];

    $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username");
    $stmt->bindParam(':username', $username);
    $stmt->execute();

    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        header('Location: '.$_SERVER['PHP_SELF']);
    } else {
        echo "اسم المستخدم أو كلمة المرور غير صحيحة!";
    }
}

// إرسال الرسالة
if (isset($_POST['send'])) {
    $receiver_id = $_POST['receiver_id'];
    $message = $_POST['message'];

    $stmt = $conn->prepare("INSERT INTO messages (sender_id, receiver_id, message) VALUES (:sender_id, :receiver_id, :message)");
    $stmt->bindParam(':sender_id', $_SESSION['user_id']);
    $stmt->bindParam(':receiver_id', $receiver_id);
    $stmt->bindParam(':message', $message);
    $stmt->execute();

    header('Location: '.$_SERVER['PHP_SELF']);
}

// جلب الرسائل وجهات الاتصال
if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];

    $stmt = $conn->prepare("SELECT id, username FROM users WHERE id != :user_id");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $contacts = $stmt->fetchAll(PDO::FETCH_ASSOC);

    $stmt = $conn->prepare("SELECT m.*, u.username as sender_name FROM messages m JOIN users u ON m.sender_id = u.id WHERE receiver_id = :user_id OR sender_id = :user_id ORDER BY timestamp ASC");
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    $messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
}
?>

<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تطبيق الدردشة</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            background-color: #f2f2f2;
        }
        form, .chat-box, .contacts, .message-form {
            width: 500px;
            margin-bottom: 20px;
            background-color: #fff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        input[type="text"], input[type="password"], textarea, select {
            margin-bottom: 10px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            width: 100%;
        }
        button {
            padding: 10px;
            background-color: #4CAF50;
            color: #fff;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        ul {
            list-style-type: none;
            padding: 0;
        }
        li {
            margin-bottom: 10px;
        }
    </style>
</head>
<body>

<?php if (!isset($_SESSION['user_id'])): ?>
    <!-- صفحة تسجيل الدخول أو التسجيل -->
    <?php if (isset($_GET['login']) || isset($_POST['login'])): ?>
        <h2>تسجيل الدخول</h2>
        <form method="POST" action="">
            <input type="text" name="username" placeholder="اسم المستخدم" required>
            <input type="password" name="password" placeholder="كلمة المرور" required>
            <button type="submit" name="login">دخول</button>
        </form>
        <p>أو <a href="?register">تسجيل حساب جديد</a></p>
    <?php else: ?>
        <h2>تسجيل حساب جديد</h2>
        <form method="POST" action="">
            <input type="text" name="username" placeholder="اسم المستخدم" required>
            <input type="password" name="password" placeholder="كلمة المرور" required>
            <button type="submit" name="register">تسجيل</button>
        </form>
        <p>أو <a href="?login">تسجيل الدخول</a></p>
    <?php endif; ?>

<?php else: ?>
    <!-- صفحة الدردشة -->
    <h2>مرحباً بك في الدردشة</h2>
    <a href="?logout">تسجيل الخروج</a>

    <div class="contacts">
        <h3>جهات الاتصال</h3>
        <ul>
            <?php foreach ($contacts as $contact): ?>
                <li><?= htmlspecialchars($contact['username']) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>

    <div class="chat-box">
        <h3>الرسائل</h3>
        <ul>
            <?php foreach ($messages as $msg): ?>
                <li><strong><?= htmlspecialchars($msg['sender_name']) ?>:</strong> <?= htmlspecialchars($msg['message']) ?></li>
            <?php endforeach; ?>
        </ul>
    </div>

    <div class="message-form">
        <h3>إرسال رسالة</h3>
        <form method="POST" action="">
            <select name="receiver_id" required>
                <option value="" disabled selected>اختر جهة الاتصال</option>
                <?php foreach ($contacts as $contact): ?>
                    <option value="<?= $contact['id'] ?>"><?= htmlspecialchars($contact['username']) ?></option>
                <?php endforeach; ?>
            </select>
            <textarea name="message" placeholder="اكتب رسالتك هنا" required></textarea>
            <button type="submit" name="send">إرسال</button>
        </form>
    </div>
<?php endif; ?>

</body>
</html>
