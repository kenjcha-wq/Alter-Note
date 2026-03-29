(function() {
    const zenPlugin = {
        name: "随机自省锚点",
        author: "Alter OpenSource",
        run: function() {
            const anchors = [
                "如果此刻是这段记忆的终点，你会如何修饰它？",
                "剥离掉所有的社会身份，现在的你是谁？",
                "今天你观察到了哪一个被他人忽略的细节？",
                "你刚才在焦虑什么？这种焦虑在一百年后还有意义吗？",
                "写下一件你今天原本想做但由于恐惧而放弃的事。"
            ];
            const pick = anchors[Math.floor(Math.random() * anchors.length)];
            AlterAPI.showMsg(`感应：${pick}`);
        }
    };
    if (window.AlterPlugins) AlterPlugins.register(zenPlugin);
})();
