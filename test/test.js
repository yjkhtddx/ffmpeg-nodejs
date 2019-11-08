const fs = require('fs');
const FFmpegNode = require('../index');

let video_addr = "http://ivi.bupt.edu.cn/hls/cctv5phd.m3u8";
video_addr = "rtsp://admin:iec123456@192.168.1.71:554/h264/ch5/main/av_stream";
// video_addr = "rtp://192.168.1.198:20000"
// video_addr = "./test.sdp"
let dir = __dirname + "/tmp/";

let level = FFmpegNode.LEVEL();
let type = FFmpegNode.TYPE();
let muxingStreamType = FFmpegNode.MuxingStreamType();
let target_type = type.JPEG;

let suffix = ".yuv";
switch (target_type) {
    case type.YUV:
        suffix = ".yuv";
        break;
    case type.RGB:
        suffix = ".rgb";
        break;
    case type.JPEG:
        suffix = ".jpg";
}

let i = 0;

async function testSyncReadImageBuffer() {
    let ffmpegNode = await FFmpegNode.init(video_addr, 120, true, true, level.DEBUG, 0, true);
    let image = null;
    while (true) {
        try {
            image = await ffmpegNode.syncReadImageBuffer(80, target_type, 10);
        } catch (error) {
            // ffmpegNode.emit("error", error);
            console.error(error);
        }
        if (image === null) {
            ffmpegNode.close();
            break;
        }

        let now = new Date();
        let name = dir + "images/buffer-" + now.getHours() + "-" + now.getMinutes() + "-" + now.getSeconds() + "-" + (i++) + suffix;
        // console.info(name);
        fs.writeFileSync(name, image);
        // console.info("====================================");
        fs.rmdirSync(name, { recursive: true });
        // global.gc();
        // if (now.getSeconds() % 5 === 0) {
        //     ffmpegNode.close();
        //     break;
        // }
    }
}

function testAsyncReadImageBuffer() {
    let ffmpegNode = FFmpegNode.init(video_addr, 120, true, true, level.DEBUG, 0, true);
    console.log(ffmpegNode);
    ffmpegNode.then((obj) => {
        obj.asyncReadImageBuffer(100, target_type, 10);
        obj.on("data", (buffer) => {
            let begin = new Date();
            // 模拟延迟300ms
            // for (var start = Date.now(); Date.now() - start <= 300;) { }
            let t1 = new Date();
            // console.info(t1.getTime() - begin.getTime());
            // begin = new Date();
            let name = dir + "images/buffer-" + t1.getHours() + "-" + t1.getMinutes() + "-" + t1.getSeconds() + "-" + (i++) + suffix;
            // console.info(name);
            fs.writeFileSync(name, buffer);
            // console.info("====================================");
            fs.rmdirSync(name, { recursive: true });
            // if (t1.getSeconds() % 10 === 0) {
            //     obj.close();
            //     return;
            // }
            // console.info(t1.getSeconds(), i++);
        });
        obj.on("error", (error) => {
            console.log("on data error............");
            console.error(error);
            obj.close();
        });
    }).catch(error => {
        console.log("init error.....");
        console.error(error);
    });
}

function testAsyncReadImageBufferThreadly() {
    let ffmpegNode = FFmpegNode.init(video_addr, 120, true, true, level.DEBUG, 0, true);
    ffmpegNode.then((obj) => {
        obj.asyncReadImageBufferThreadly(100, target_type, 1);
        obj.on("data", (buffer) => {
            let begin = new Date();
            // 模拟延迟300ms
            // for (var start = Date.now(); Date.now() - start <= 300;) { }
            let t1 = new Date();
            console.info(t1.getTime() - begin.getTime());
            begin = new Date();
            let name = dir + "images/buffer-" + t1.getHours() + "-" + t1.getMinutes() + "-" + t1.getSeconds() + "-" + (i++) + suffix;
            console.info(name);
            fs.writeFileSync(name, buffer);
            console.info("====================================");
            fs.rmdirSync(name, { recursive: true });
            // if (t1.getSeconds() % 10 === 0) {
            //     obj.close();
            //     return;
            // }
            // console.info(t1.getSeconds(), i++);
        });
        obj.on("error", (error) => {
            console.log("on data error............");
            console.error(error);
            obj.close();
        });
    }).catch(error => {
        console.log("init error.....");
        console.error(error);
    });
}

// let videoFilePath = dir + "videos/test.m3u8";
// videoFilePath = "http://192.168.1.198:3106";
// FFmpegNode.recordVideo(video_addr, videoFilePath, -1, false, level.DEBUG, muxingStreamType.FLV);

// testAsyncReadImageBuffer();
testAsyncReadImageBufferThreadly();

// FFmpegNode.sayHello(520, (output) => {
//     console.log(output);
//     console.log("......");
// });
// console.log("......");
// testSyncReadImageBuffer().then().catch(error => {
//     console.error(error);
// });

