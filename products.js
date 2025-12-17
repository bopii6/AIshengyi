// 产品数据 - 方便后续维护和添加
const products = [
    {
        id: 1,
        name: "AI职业照生成器",
        category: "image",
        categoryName: "图像生成",
        description: "一键将普通照片转换为专业LinkedIn风格职业照，支持多种背景和服装风格",
        price: 499,
        icon: "📸",
        features: ["一键换装", "多种背景可选", "高清导出", "批量处理"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 2,
        name: "AI数字人视频",
        category: "digital-human",
        categoryName: "数字人",
        description: "输入文字脚本，自动生成逼真AI数字人播报视频，适合短视频、培训、营销",
        price: 1999,
        icon: "🎬",
        features: ["多种形象可选", "中英双语", "口型同步", "4K画质"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 3,
        name: "AI英语口语教练",
        category: "education",
        categoryName: "教育学习",
        description: "AI驱动的英语口语练习应用，实时纠音、场景对话、进度追踪",
        price: 899,
        icon: "🗣️",
        features: ["实时语音识别", "发音纠正", "场景对话", "学习报告"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 4,
        name: "AI客服助手",
        category: "assistant",
        categoryName: "AI助手",
        description: "智能客服机器人，支持多平台接入，24小时自动回复客户咨询",
        price: 1299,
        icon: "🤖",
        features: ["多平台接入", "知识库训练", "自动学习", "数据分析"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 5,
        name: "AI文案生成器",
        category: "assistant",
        categoryName: "AI助手",
        description: "一键生成小红书、抖音、公众号等平台的爆款文案，提升内容创作效率",
        price: 399,
        icon: "✍️",
        features: ["多平台模板", "SEO优化", "热点追踪", "批量生成"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 6,
        name: "AI证件照制作",
        category: "image",
        categoryName: "图像生成",
        description: "一键生成各种尺寸规格的证件照，自动换背景、美颜、调整光线",
        price: 299,
        icon: "🪪",
        features: ["多尺寸规格", "自动换背景", "智能美颜", "一键导出"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 7,
        name: "AI PPT生成器",
        category: "assistant",
        categoryName: "AI助手",
        description: "输入主题或大纲，自动生成精美PPT，支持多种风格模板",
        price: 599,
        icon: "📊",
        features: ["多种模板", "智能排版", "一键生成", "可编辑导出"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 8,
        name: "AI视频脚本助手",
        category: "assistant",
        categoryName: "AI助手",
        description: "根据主题自动生成短视频脚本，包含分镜、台词、拍摄建议",
        price: 349,
        icon: "🎥",
        features: ["分镜生成", "台词优化", "拍摄建议", "多风格适配"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 9,
        name: "AI头像生成器",
        category: "image",
        categoryName: "图像生成",
        description: "上传照片生成多种风格的AI艺术头像，卡通、写实、二次元等",
        price: 249,
        icon: "🎨",
        features: ["多种风格", "高清输出", "批量生成", "可商用"],
        demoUrl: "",
        imageUrl: ""
    },
    {
        id: 10,
        name: "AI直播提词器",
        category: "assistant",
        categoryName: "AI助手",
        description: "直播专用智能提词器，根据话题自动生成互动问题和话术",
        price: 199,
        icon: "📺",
        features: ["智能生成", "实时显示", "快捷切换", "话术库"],
        demoUrl: "",
        imageUrl: ""
    }
];

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = products;
}
