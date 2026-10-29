// const logger = require('@varnxy/logger')
// logger.setDirectory('/Users/zhang/Work/WorkSpaces/WebWorkSpace/picgo-plugin-web-uploader-custom-url-prefix/logs')
// let log = logger('plugin')

// 上传文件夹支持的占位符，与 PicList 高级重命名保持一致，按上传时的本地时间替换
const pad = (num, len = 2) => String(num).padStart(len, "0");
const FOLDER_PLACEHOLDERS = {
    Y: (date) => String(date.getFullYear()),
    y: (date) => String(date.getFullYear()).slice(2),
    m: (date) => pad(date.getMonth() + 1),
    d: (date) => pad(date.getDate()),
    h: (date) => pad(date.getHours()),
    i: (date) => pad(date.getMinutes()),
    s: (date) => pad(date.getSeconds()),
    ms: (date) => pad(date.getMilliseconds(), 3),
    timestamp: (date) => String(Math.floor(date.getTime() / 1000)),
};

const FOLDER_TIPS = [
    "图片上传到的文件夹，留空表示根目录，多级目录用 / 分隔。",
    "支持以下占位符（按上传时间替换）：",
    "{Y} 4位年份  {y} 2位年份  {m} 月  {d} 日",
    "{h} 时  {i} 分  {s} 秒  {ms} 毫秒  {timestamp} 秒级时间戳",
    "示例：blog/{Y}/{m} → blog/2026/10",
    "花括号必须成对出现且只能包含上述占位符，否则上传时会报错。",
].join("\n");

// 校验文件夹模板，合法返回 null，否则返回错误说明
const validateFolder = (folder) => {
    if (!folder) {
        return null;
    }
    const tokenReg = /\{([^{}]*)\}/g;
    let match;
    while ((match = tokenReg.exec(folder)) !== null) {
        if (!FOLDER_PLACEHOLDERS.hasOwnProperty(match[1])) {
            return `不支持的占位符 {${match[1]}}，可用：` +
                Object.keys(FOLDER_PLACEHOLDERS).map((key) => `{${key}}`).join(" ");
        }
    }
    const rest = folder.replace(tokenReg, "");
    if (rest.includes("{") || rest.includes("}")) {
        return "花括号不匹配，请检查 { 和 } 是否成对出现";
    }
    return null;
};

// 替换占位符并规范化路径：去空白、\ 转 /、合并重复 /、去掉首尾 /
const resolveFolder = (folder, date) => {
    return folder
        .replace(/\{([^{}]*)\}/g, (_, key) => FOLDER_PLACEHOLDERS[key](date))
        .trim()
        .replace(/\\/g, "/")
        .replace(/\/{2,}/g, "/")
        .replace(/^\/|\/$/g, "");
};

module.exports = (ctx) => {
    const register = () => {
        ctx.helper.uploader.register("uploader-sanyue-imgbed", {
            handle,
            name: "ImgBed Sanyue",
            config: config,
        });
    };
    const handle = async function(ctx) {
        let userConfig = ctx.getConfig("picBed.uploader-sanyue-imgbed");
        if (!userConfig) {
            throw new Error("Can't find uploader config");
        }
        let url = userConfig.url.replace(/\/+$/, "") + "/upload";
        let uploadChannel = userConfig.upload_channel;
        if (!uploadChannel) {
            uploadChannel = "telegram";
        }

        url = url +"?returnFormat=full"+ "&" + "uploadChannel=" + uploadChannel;
        const folderTemplate = (userConfig.upload_folder || "").trim();
        const folderError = validateFolder(folderTemplate);
        if (folderError) {
            ctx.emit("notification", {
                title: "上传目标文件夹配置错误",
                body: folderError,
            });
            throw new Error("上传目标文件夹配置错误：" + folderError);
        }
        const uploadFolder = resolveFolder(folderTemplate, new Date());
        if (uploadFolder) {
            url = url + "&uploadFolder=" + encodeURIComponent(uploadFolder);
        }
        const paramName = "file";
        const jsonPath = "src";
        const token = {
            Authorization: userConfig.token,
        };
        try {
            let imgList = ctx.output;
            for (let i in imgList) {
                let image = imgList[i].buffer;
                if (!image && imgList[i].base64Image) {
                    image = Buffer.from(imgList[i].base64Image, "base64");
                }
                const postConfig = postOptions(
                    ctx,
                    image,
                    token,
                    url,
                    paramName,
                    imgList[i].fileName
                );
                let body = await ctx.Request.request(postConfig);

                delete imgList[i].base64Image;
                delete imgList[i].buffer;

                //以 Array 方式解析然后拿第一个参数
                const result = JSON.parse(body);
                if (!Array.isArray(result) || !result[0]) {
                    throw new Error("服务端返回异常：" + (typeof body === "string" ? body : JSON.stringify(body)));
                }
                body = result[0];
                // body = JSON.parse(body)
                let imgUrl = body;
                for (let field of jsonPath.split(".")) {
                    imgUrl = imgUrl[field];
                }
                if (imgUrl) {
                    imgList[i]["imgUrl"] =  imgUrl;
                } else {
                    throw new Error("返回解析失败，请检查JsonPath设置");
                }
            }
        } catch (err) {
            ctx.emit("notification", {
                title: "上传失败",
                body: (err && err.message) || String(err),
            });
            throw err;
        }
    };

    const postOptions = (ctx, image, token, url, paramName, fileName) => {
        let headers = {
            contentType: "multipart/form-data",
            "User-Agent": "PicGo",
        };

        if (token) {
            headers = Object.assign(headers, token);
        }
        let formData = {};
        const opts = {
            method: "POST",
            url: url,
            headers: headers,
            formData: formData,
        };
        opts.formData[paramName] = {};
        opts.formData[paramName].value = image;
        opts.formData[paramName].options = {
            filename: fileName,
        };
        return opts;
    };

    const config = (ctx) => {
        let userConfig = ctx.getConfig("picBed.uploader-sanyue-imgbed");
        if (!userConfig) {
            userConfig = {};
        }
        return [{
                name: "url",
                type: "input",
                default: userConfig.url,
                required: true,
                message: "API地址(不包含 /upload)",
                alias: "API地址",
            },
            {
                name: "token",
                type: "password",
                default: userConfig.token,
                required: true,
                message: "SanYue图床拥有上传权限的 token",
                alias: "Token",
            },
            {
                name: "upload_channel",
                type: "list",
                default: userConfig.upload_channel,
                required: false,
                alias: "上传渠道(默认为 Telegram)",
                choices: [{
                        name: "TG",
                        value: "telegram",
                    },
                    {
                        name: "CF-R2",
                        value: "cfr2",
                    },
                    {
                        name: "S3",
                        value: "s3",
                    },
                ],
            },
            {
                name: "upload_folder",
                type: "input",
                default: userConfig.upload_folder,
                required: false,
                message: "留空为根目录，支持占位符，如 blog/{Y}/{m}",
                alias: "上传目标文件夹",
                // 不能使用 validate 等函数字段：GUI 通过 IPC 传递配置项，函数无法序列化会导致设置页加载失败，
                // 合法性校验在上传前进行
                tips: FOLDER_TIPS,
            },
        ];
    };
    return {
        uploader: "uploader-sanyue-imgbed",
        register,
    };
};
