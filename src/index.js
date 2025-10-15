// const logger = require('@varnxy/logger')
// logger.setDirectory('/Users/zhang/Work/WorkSpaces/WebWorkSpace/picgo-plugin-web-uploader-custom-url-prefix/logs')
// let log = logger('plugin')

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
        let url = userConfig.url + "/upload";
        let uploadChannel = userConfig.upload_channel;
        if (!uploadChannel) {
            uploadChannel = "telegram";
        }

        url = url +"?returnFormat=full"+ "&" + "uploadChannel=" + uploadChannel;
        let uploadFolder = userConfig.upload_folder;
        if (uploadFolder) {
            url = url + "&uploadFolder=" + uploadFolder;
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
                body = JSON.parse(body)[0];
                // body = JSON.parse(body)
                let imgUrl = body;
                for (let field of jsonPath.split(".")) {
                    imgUrl = imgUrl[field];
                }
                if (imgUrl) {
                    imgList[i]["imgUrl"] =  imgUrl;
                } else {
                    ctx.emit("notification", {
                        title: "返回解析失败",
                        body: "请检查JsonPath设置",
                    });
                }
            }
        } catch (err) {
            ctx.emit("notification", {
                title: "上传失败",
                body: JSON.stringify(err),
            });
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
                message: "上传目标文件夹(默认空字符串，表示根目录)",
                alias: "上传目标文件夹",
            },
        ];
    };
    return {
        uploader: "uploader-sanyue-imgbed",
        register,
    };
};
