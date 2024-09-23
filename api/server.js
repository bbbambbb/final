const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
app.use(express.json());
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const jwt_decode = require('jwt-decode');

const User = require("./models/user");
const Blog = require("./models/blog");
const Message = require("./models/message");
const Comment = require('./models/comment');
const Like = require('./models/like');


const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

mongoose
    .connect('mongodb+srv://test:1234@cluster0.rnmm5j0.mongodb.net/hahaiapp?retryWrites=true&w=majority', {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    })
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB", error);
    });

app.listen(5001, () => {
    console.log("Node js server started.");
});

//endpoint ลงทะเบียน
app.post("/register", async (req, res) => {
    try {
        const { username, email, firstname, lastname, password } = req.body;

        const existingEmailUser = await User.findOne({ email });
        if (existingEmailUser) {
            console.log("อีเมลนี้ลงทะเบียนแล้ว");
            return res.status(400).json({ message: "อีเมลนี้ลงทะเบียนแล้ว" });
        }

        const existingUsernameUser = await User.findOne({ username });
        if (existingUsernameUser) {
            console.log("ชื่อผู้ใช้นี้ลงทะเบียนแล้ว");
            return res.status(400).json({ message: "ชื่อผู้ใช้นี้ลงทะเบียนแล้ว" });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            firstname,
            lastname,
            verificationToken: crypto.randomBytes(20).toString("hex"),
            password: encryptedPassword,
        });

        console.log('ลงทะเบียนผู้ใช้ใหม่:', newUser);

        await newUser.save();

        await sendVerificationEmail(newUser.email, newUser.verificationToken);

        res.status(202).json({
            status: 'ok',
            email: newUser.email,
            verificationToken: newUser.verificationToken
        });
    } catch (error) {
        console.log("Error registering user", error);
        res.status(500).json({ message: "ลงทะเบียนไม่สำเร็จ กรุณาลองอีกครั้ง" });
    }
});

//ส่งอีเมล
const sendVerificationEmail = async (email, verificationToken) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kkingblub@gmail.com',
            pass: 'heymiayqhsociwcx',
        },
    });

    const mailOptions = {
        from: 'kkingblub@gmail.com',
        to: email,
        subject: 'กรุณายืนยันอีเมลของคุณ',
        html: `
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; background-color: #f9f9f9;">
                <!-- Header with Logo -->
                <div style="background-color: white; text-align: center; border-bottom: 1px solid #ddd;">
                    <img src="https://lh3.googleusercontent.com/pw/AP1GczPc0lvTH1B1p8Rz4_CzPotTNd4RCJ4akxTbxJBAP0JAsl6u7JOyHUl8BucbLdQhdUqPh7q5hAkhhNMBYBGiFYBkj4MqrxLqjfBU32qfXM4c_IGPRh4Biyf-pBMcqr83iF5Qq1mQ7rhdyaHBBQPlK2PG=w251-h240-s-no-gm?authuser=0" alt="Logo" style="width: 200px;"/>
                </div>
                
                <!-- Main Content -->
                <div style="text-align: center; color: #333; background-color: #f9f9f9;">
                    <h2 style="color: #006FFD; font-size: 24px; margin-bottom: 20px;">ยินดีต้อนรับสู่ระบบลงทะเบียน</h2>
                    <p style="font-size: 18px; margin: 0;">สวัสดีค่ะ</p>
                    <p style="font-size: 16px; margin: 20px 0;">กรุณาคลิกที่ปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
                    <p style="margin-top: 20px;">
                        <a href="http://192.168.1.85:5001/verify/${verificationToken}"
                            style="display: inline-block; padding: 15px 30px; background-color: #006FFD; color: white; text-decoration: none; border-radius: 10px; font-size: 16px; font-weight: bold;">
                            คลิกที่นี่เพื่อยืนยัน
                        </a>
                    </p>
                </div>
                
                <!-- Footer -->
                <div style="background-color: white; padding: 20px; margin-top: 30px; border-top: 1px solid #ddd; text-align: center;">
                    <p style="font-size: 14px; color: #999; margin: 0;">ขอบคุณที่ใช้บริการของเรา!</p>
                    <p style="font-size: 14px; color: #999; margin: 5px 0;">หากคุณมีคำถามหรือข้อสงสัย โปรดติดต่อเราที่ <a href="mailto:support@example.com" style="color: #006FFD;">support@example.com</a></p>
                    <p style="font-size: 12px; color: #aaa; margin: 0;">© 2024 Company Name. All rights reserved.</p>
                </div>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('ส่งอีเมลยืนยันเรียบร้อยแล้ว');
    } catch (error) {
        console.log('เกิดข้อผิดพลาดในการส่งอีเมลยืนยัน', error);
    }
};

//endpoint ยืนยันอีเมล
app.get("/verify/:token", async (req, res) => {
    try {
        const { token } = req.params;
        console.log("ได้รับ token แล้ว:", token);

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้หรือ token ไม่ถูกต้อง" });
        }

        const tokenAge = Date.now() - new Date(user.createdAt).getTime();
        if (tokenAge > 1 * 60 * 1000) {
            user.verificationToken = undefined;
            await user.save();
            console.log("โทเค็นหมดอายุแล้ว กรุณาขอโทเค็นใหม่:");
            return res.status(400).send(`<p>หมดเวลายืนยันอีเมล กรุณาส่งอีเมลยืนยันอีกครั้ง...</p>`);
        }

        user.verified = true;
        user.verificationToken = undefined;

        await user.save();

        console.log("ยืนยันผู้ใช้เรียบร้อยแล้ว");

        return res.status(200).send(`<p>โปรดรอสักครู่...</p>`);

    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการยืนยันอีเมล", error);
        if (!res.headersSent) {
            return res.status(500).json({ message: "ยืนยันอีเมลล้มเหลว กรุณาลองอีกครั้ง" });
        }
    }
});

//endpoint ตรวจสอบการยืนยันอีเมล
app.get("/verify-status/:email", async (req, res) => {
    try {
        const email = req.params.email;
        console.log("ได้รับอีเมล์แล้ว:", email);
        const user = await User.findOne({ email });
        //console.log("พบผู้ใช้:", user);

        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้หรือ email ไม่ถูกต้อง" });
        }

        if (user.verified) {
            res.status(200).json({ message: "ผู้ใช้ยืนยันอีเมลแล้ว" });
        } else {
            res.status(400).json({ message: "ผู้ใช้ยังไม่ได้ยืนยันอีเมล" });
        }

    } catch (error) {
        res.status(500).json({ message: "ตรวจสอบสถานะการยืนยันอีเมลล้มเหลว กรุณาลองอีกครั้ง" });
    }
});

const generateSecretKey = () => {
    const secretKey = crypto.randomBytes(32).toString("hex");
    return secretKey;
};

const secretKey = generateSecretKey();

//endpoint ส่งอีเมลอีกรอบ
app.post('/resend', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'ไม่พบผู้ใช้ที่ลงทะเบียนอีเมลนี้' });
        }

        if (user.verified) {
            return res.status(400).json({ message: 'อีเมลนี้ได้รับการยืนยันแล้ว' });
        }

        const newVerificationToken = crypto.randomBytes(20).toString('hex');
        user.verificationToken = newVerificationToken;
        user.createdAt = new Date();

        await user.save();

        await sendVerificationEmail(user.email, newVerificationToken);

        res.status(200).json({ message: 'ส่งอีเมลยืนยันใหม่เรียบร้อยแล้ว' });

    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการส่งอีเมลยืนยันใหม่", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการส่งอีเมลยืนยันใหม่' });
    }
});

//endpoint เข้าสู่ระบบ
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
        }

        if (!user.verified) {
            return res.status(401).json({ message: "กรุณายืนยันอีเมลของคุณก่อนเข้าสู่ระบบ" });
        }

        const token = jwt.sign({ userId: user._id }, secretKey);
        console.log("Token: ", token);

        res.status(200).json({ status: 'ok', token });

    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้ง", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองอีกครั้ง" });
    }
});

//endpoint แสดงข้อมูลผู้ใช้
app.get("/profile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ลงทะเบียน" });
        }

        res.status(200).json({ user });

    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแสดงข้อมูลผู้ใช้" });
    }
});

// ส่งรหัสรีเซ็ตรหัสผ่าน
const sendResetCodeEmail = async (email, resetCode, firstname, lastname) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'kkingblub@gmail.com',
            pass: 'heymiayqhsociwcx',
        },
    });

    const mailOptions = {
        from: 'kkingblub@gmail.com',
        to: email,
        subject: 'รหัสรีเซ็ตรหัสผ่าน',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
                <h2 style="color: #006FFD; text-align: center; font-size: 20px;">รีเซ็ตรหัสผ่านของคุณ</h2>
                <p style="font-size: 16px; color: #333; text-align: center;">สวัสดีคุณ ${firstname} ${lastname}</p>
                <p style="font-size: 16px; color: #333; text-align: center;">
                    คุณได้ร้องขอให้รีเซ็ตรหัสผ่าน กรุณาใช้รหัสด้านล่างนี้ภายใน 1 นาที:
                </p>
                <div style="text-align: center; margin: 20px 0;">
                    <span style="display: inline-block; padding: 10px 15px; font-size: 20px; color: #fff; background-color: #006FFD; border-radius: 4px;">
                        ${resetCode}
                    </span>
                </div>
                <p style="font-size: 16px; color: #333; text-align: center;">
                    หากคุณมีคำถามเพิ่มเติม กรุณาติดต่อเราที่ kkingblub@gmail.com
                </p>
                <p style="font-size: 16px; color: #333; text-align: center;">
                    ขอบคุณ, ทีมงาน Hahai application
                </p>
            </div>
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('ส่งรหัสยืนยันเรียบร้อยแล้ว');
    } catch (error) {
        console.log('เกิดข้อผิดพลาดในการส่งรหัสยืนยัน', error);
        throw error;
    }
};

let resetCodes = {};

//endpoint รีเซ็ตรหัสผ่าน
app.post('/resetPassword', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("ไม่พบผู้ใช้ที่ลงทะเบียนอีเมลนี้");
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ลงทะเบียนอีเมลนี้' });
        }

        console.log('User details:', user);

        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        resetCodes[email] = {
            code: resetCode,
            expires: Date.now() + 60000
        };

        await sendResetCodeEmail(email, resetCode, user.firstname, user.lastname);

        res.status(200).json({ status: 'ok', message: 'รหัสรีเซ็ตถูกส่งไปยังอีเมลของคุณแล้ว' });

    } catch (error) {
        console.log("มีปัญหาในการรีเซ็ตรหัสผ่านของคุณ กรุณาลองอีกครั้ง", error);
        res.status(500).json({ message: 'มีปัญหาในการรีเซ็ตรหัสผ่านของคุณ กรุณาลองอีกครั้ง' });
    }
});

//endpoint ยืนยันรหัสรีเซ็ต
app.post('/verifyResetCode', async (req, res) => {
    const { email, code } = req.body;

    try {
        const resetCodeEntry = resetCodes[email];
        if (!resetCodeEntry) {
            console.log("ไม่พบรหัสรีเซ็ตหรือรหัสรีเซ็ตหมดอายุแล้ว");
            return res.status(404).json({ message: 'ไม่พบรหัสรีเซ็ตหรือรหัสรีเซ็ตหมดอายุแล้ว' });
        }

        if (Date.now() > resetCodeEntry.expires) {
            console.log("รหัสรีเซ็ตหมดอายุแล้ว");
            delete resetCodes[email];
            return res.status(400).json({ message: 'รหัสรีเซ็ตหมดอายุแล้ว' });
        }

        if (resetCodeEntry.code !== code) {
            console.log("รหัสรีเซ็ตไม่ถูกต้อง");
            return res.status(400).json({ message: 'รหัสรีเซ็ตไม่ถูกต้อง' });
        }

        console.log("รหัสรีเซ็ตถูกต้อง");
        return res.status(200).json({ status: 'ok', message: 'รหัสรีเซ็ตถูกต้อง' });

    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการตรวจสอบรหัสรีเซ็ต", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการตรวจสอบรหัสรีเซ็ต' });
    }
});

//endpoint ตั้งรหัสผ่านใหม่
app.post('/newPassword', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log("ไม่พบผู้ใช้ที่ลงทะเบียนอีเมลนี้");
            return res.status(404).json({ message: 'ไม่พบผู้ใช้ที่ลงทะเบียนอีเมลนี้' });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);
        user.password = encryptedPassword;
        await user.save();

        console.log("เปลี่ยนรหัสผ่านเรียบร้อยแล้ว");
        return res.status(200).json({ message: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });

    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน", error);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
    }
});

//endpoint อัพเดทรหัสผ่าน
app.put("/updatePassword/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const { password } = req.body;

        if (!password) {
            return res.status(400).json({ message: "รหัสผ่านไม่ถูกต้อง" });
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        const result = await User.findByIdAndUpdate(userId, { password: encryptedPassword });

        if (!result) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        res.status(200).json({ message: "อัปเดตรหัสผ่านสำเร็จแล้ว" });

    } catch (error) {
        console.log("เกิดข้อผิดพลาด อัปเดตรหัสผ่านไม่สำเร็จ", error);
        res.status(500).json({ message: "อัปเดตรหัสผ่านไม่สำเร็จ" });
    }
});

//endpoint อัพเดทข้อมูลผู้ใช้
app.put("/updateProfile/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;
        const { username, firstname, lastname, profileImage } = req.body;

        const result = await User.findByIdAndUpdate(userId, { username, firstname, lastname, profileImage });

        if (!result) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        res.status(200).json({ message: "อัปเดตโปรไฟล์สำเร็จแล้ว" });

    } catch (error) {
        console.log("เกิดข้อผิดพลาด อัปเดตโปรไฟล์ไม่สำเร็จ", error);
        res.status(500).json({ message: "อัปเดตโปรไฟล์ไม่สำเร็จ" });
    }
});

//endpoint ลบผู้ใช้
app.post("/deleteUser/:userId", async (req, res) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ message: "ต้องระบุรหัสผู้ใช้" });
        }

        const user = await User.findByIdAndDelete(userId);

        if (!user) {
            return res.status(404).json({ message: "ไม่พบข้อมูลผู้ใช้" });
        }

        res.status(200).json({ message: "ลบข้อมูลผู้ใช้สำเร็จแล้ว" });
    } catch (error) {
        console.error("เกิดข้อผิดพลาด ลบข้อมูลผู้ใช้ไม่สำเร็จ", error);
        res.status(500).json({ message: "ลบข้อมูลผู้ใช้ไม่สำเร็จ" });
    }
});

//endpoint แสดงกระทู้ทั้งหมด
app.get("/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().populate("user", "username firstname lastname profileImage");

        // กรองกระทู้ที่ไม่มีข้อมูลผู้ใช้งานออกไป
        const validBlogs = blogs.filter(blog => blog.user !== null);

        // วนลูปตรวจสอบกระทู้ที่ไม่มีผู้ใช้งานและทำการลบ
        const blogsToDelete = blogs.filter(blog => blog.user === null);
        blogsToDelete.forEach(async blog => {
            await Blog.findByIdAndDelete(blog._id);
        });

        res.status(200).json({ blogs: validBlogs });
    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการแสดงกระทู้", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแสดงกระทู้" });
    }
});


// Endpoint สำหรับดึงข้อมูลบล็อกตาม blogId
app.get('/blogs/:blogId', async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId)
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username firstname lastname profileImage'
                }
            })
            .exec();

        if (!blog) return res.status(404).json({ message: 'Blog not found' });

        res.json(blog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//endpoint แสดงข้อมูลผู้สร้างบล็อก
app.get("/blogs/:blogId/:userId", async (req, res) => {
    try {
        const blogs = req.params.blogs;

        const blog = await Blog.findById(blogs).populate('userId'); // Assuming 'userId' is the field for the creator's ID
        if (!blog) {
            return res.status(404).json({ message: "ไม่พบบล็อกที่ระบุ" });
        }

        const userId = blog.userId;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "ไม่พบผู้ใช้ที่ลงทะเบียน" });
        }

        res.status(200).json({ user });

    } catch (error) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการแสดงข้อมูลผู้ใช้" });
    }
});



//สร้างกระทู้
app.post("/create", async (req, res) => {
    try {
        const { obj_picture, object_type, object_subtype, color, location, note, userId } = req.body;

        const newBlog = new Blog({
            obj_picture: obj_picture,
            object_type: object_type,
            object_subtype: object_subtype,
            color: color,
            location: location,
            note: note,
            user: userId,
        });

        await newBlog.save();

        res.status(201).json({ message: "สร้างกระทู้สำเร็จ" });
    } catch (error) {
        console.log("เกิดข้อผิดพลาดในการสร้างกระทู้", error);
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้างกระทู้" });
    }
});

const multer = require("multer");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "files/");
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + "-" + file.originalname);
    },
});

const upload = multer({ storage: storage });

// Endpoint ส่งข้อความ
app.post('/messages', upload.single("imageFile"), async (req, res) => {
    try {
        const { senderId, messageType, messageText } = req.body;
        const imageUrl = req.file ? req.file.path : null;

        const newMessage = new Message({
            senderId,
            messageType,
            message: messageText,
            timestamp: new Date(),
            imageUrl: imageUrl,
        });

        await newMessage.save();
        res.status(200).json({ message: "ส่งข้อความสำเร็จ" });
    } catch (error) {
        console.error("Error handling the request", error);
        res.status(500).send({ message: 'Server Error' });
    }
});

// Endpoint รับข้อความ
app.get("/messages/:senderId", async (req, res) => {
    try {
        const { senderId } = req.params;

        const messages = await Message.find({
            senderId: senderId
        }).populate("senderId", "_id firstname lastname");

        res.json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดทางเซิฟเวอร์" });
    }
});


//endpoint แสดงข้อความระหว่างผู้ใช้สองคนในห้องแชท
app.get("/messages/:senderId/:recepientId", async (req, res) => {
    try {
        const { senderId, recepientId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId: senderId, recepientId: recepientId },
                { senderId: recepientId, recepientId: senderId },
            ],
        }).populate("senderId", "_id firstname lastname");

        res.json(messages);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "เกิดข้อผิดพลาดทางเซิฟเวอร์" });
    }
});

//endpoint ลบข้อความ
app.post("/deleteMessages", async (req, res) => {
    try {
        const { messages } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ message: "คำขอไม่ถูกต้อง" });
        }

        await Message.deleteMany({ _id: { $in: messages } });

        res.json({ message: "ลบข้อความสำเร็จ" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "เกิดข้อผิดพลาด ลบข้อความสำเร็จ" });
    }
});


//คอมเม้น
// Fetch all comments for a specific blog post
// Fetch all comments for a specific blog post
// ดึงบล็อกและความคิดเห็นทั้งหมด
app.get('/blogs/:blogId', async (req, res) => {
    const { blogId } = req.params;

    try {
        // ค้นหาบล็อกและดึงความคิดเห็นทั้งหมด
        const blog = await Blog.findById(blogId).populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'profileImage username firstname lastname'
            }
        });

        // ตรวจสอบว่าพบบล็อกหรือไม่
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        // ส่งบล็อกและความคิดเห็นทั้งหมดที่พบ
        res.status(200).json({ blog });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});



//แสดงความคิดเห็น
app.post('/blogs/:blogId/comments', async (req, res) => {
    const { userId, comment } = req.body;  // Assuming you're sending userId and the comment text
    const { blogId } = req.params;

    try {
        // Create a new comment
        const newComment = new Comment({
            blog: blogId,  // Associate with the blog
            user: userId,  // Associate with the user
            comment,          // The comment comment
        });

        // Save the comment to the database
        await newComment.save();

        // Push the new comment's ID into the blog's comments array
        await Blog.findByIdAndUpdate(blogId, { $push: { comments: newComment._id } });

        // Return the created comment
        res.status(201).json(newComment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


//ลบความคิดเห็น
app.delete('/blogs/:blogId/comments/:commentId', async (req, res) => {
    const { blogId, commentId } = req.params;

    try {
        // Find the blog and pull the comment from its comments array
        await Blog.findByIdAndUpdate(blogId, { $pull: { comments: commentId } });

        // Delete the comment from the comments collection
        await Comment.findByIdAndDelete(commentId);

        // Respond with a success message
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

//แก้ไขความคิดเห็น
app.put('/blogs/:blogId/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { comment } = req.body;  // The new comment text

    try {
        // Find the comment by its ID and update the content
        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { comment },  // Update the comment field
            { new: true }  // Return the updated document
        );

        if (!updatedComment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Respond with the updated comment
        res.status(200).json(updatedComment);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// app.delete('/blogs/:blogId/comments/:commentId', async (req, res) => {
//     const { commentId } = req.params;
//     const { userId, blogId } = req.body;

//     try {
//         const comment = await Comment.findById(commentId);

//         if (!comment) {
//             return res.status(404).json({ error: 'Comment not found' });
//         }

//         if (comment.userId.toString() !== userId && !await blogOwner(userId, blogId)) {
//             return res.status(403).json({ error: 'Not authorized to delete this comment' });
//         }

//         await Comment.findByIdAndDelete(commentId);
//         await Blog.findByIdAndUpdate(blogId, { $pull: { comments: commentId } });
//         res.status(200).json({ message: 'Comment deleted' });
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });



// app.put('/blogs/:blogId/comments/:commentId', async (req, res) => {
//     const { commentId } = req.params;
//     const { userId, comment } = req.body;

//     try {
//         const comment = await Comment.findById(commentId);

//         if (!comment) {
//             return res.status(404).json({ error: 'Comment not found' });
//         }

//         if (comment.userId.toString() !== userId) {
//             return res.status(403).json({ error: 'Not authorized to update this comment' });
//         }

//         comment.text = text;
//         await comment.save();
//         res.status(200).json(comment);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

// const blogOwner = async (userId, blogId) => {
//     const blog = await Blog.findById(blogId);
//     return blog && blog.userId.toString() === userId;
// };


// app.post('/blogs/like/:blogId', async (req, res) => {
//     const blogId = req.params.blogId;
//     const userId = req.body.userId;

//     console.log(`Blog ID: ${blogId}, User ID: ${userId}`); // Add this line

//     if (!userId || !blogId) {
//         return res.status(400).json({ error: 'Invalid request' });
//     }

//     try {
//         const blog = await Blog.findById(blogId);
//         if (!blog) {
//             return res.status(404).json({ message: 'Blog not found' });
//         }

//         const likeIndex = blog.likes.indexOf(userId);
//         if (likeIndex > -1) {
//             // User has already liked, so unlike
//             blog.likes.splice(likeIndex, 1);
//         } else {
//             // User has not liked, so like
//             blog.likes.push(userId);
//         }

//         await blog.save();
//         res.status(200).json({ message: 'Like status updated successfully', likes: blog.likes });
//     } catch (error) {
//         console.error('Error in /blogs/like/:blogId route:', error);
//         res.status(500).json({ message: 'Server error', error: error.message });
//     }
// });

// // app.post('/comments/:commentId/reply', async (req, res) => {
// //     try {
// //       const { commentId } = req.params;
// //       const { comment, userId } = req.body;

// //       // Find the comment and push the new reply to the replies array
// //       const commentToReply = await Comment.findById(commentId);
// //       commentToReply.replies.push({ user: userId, comment });

// //       await commentToReply.save();
// //       res.status(200).json(commentToReply);
// //     } catch (err) {
// //       res.status(500).json({ message: 'Error posting reply', error: err.message });
// //     }
// //   });

// app.put('/blogs/:blogId/comments/:commentId', async (req, res) => {
//     const { commentId } = req.params;
//     const { comment } = req.body;

//     try {
//         const updatedComment = await Comment.findByIdAndUpdate(commentId, { comment }, { new: true });
//         if (!updatedComment) return res.status(404).send('Comment not found');
//         res.json(updatedComment);
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// });

// app.delete('/blogs/:blogId/comments/:commentId', async (req, res) => {
//     const { commentId } = req.params;

//     try {
//         const deletedComment = await Comment.findByIdAndDelete(commentId);
//         if (!deletedComment) return res.status(404).send('Comment not found');
//         res.send('Comment deleted');
//     } catch (error) {
//         res.status(500).send('Server error');
//     }
// });

