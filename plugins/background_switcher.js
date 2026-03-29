/**
 * 插件名称：视觉背景切换 (Visual Background Switcher)
 * 插件功能：支持通过颜色代码或图片链接动态修改应用背景。
 * 存储位置：/plugins/background_switcher.js
 */
(function() {
    const bgSwitcher = {
        name: "视觉背景切换",
        author: "Alter OpenSource",
        run: function() {
            const choice = prompt("更换背景：\n1. 输入颜色代码 (如 #e3e3e3)\n2. 输入图片链接 (http...)\n3. 输入 reset 还原");
            
            // 用户取消输入
            if (choice === null) return;

            const target = document.body;
            const action = choice.trim().toLowerCase();

            if (action === 'reset') {
                // 还原逻辑
                target.style.background = '';
                target.style.backgroundImage = '';
                AlterAPI.showMsg("已恢复原始视野");
            } else if (action.startsWith('http') || action.startsWith('https')) {
                // 图片链接逻辑
                target.style.backgroundImage = "url('" + choice + "')";
                target.style.backgroundSize = "cover";
                target.style.backgroundPosition = "center";
                target.style.backgroundAttachment = "fixed";
                AlterAPI.showMsg("壁纸意境已同步");
            } else {
                // 颜色代码逻辑
                target.style.backgroundImage = 'none';
                target.style.backgroundColor = choice;
                AlterAPI.showMsg("环境色彩已重构");
            }
        }
    };

    // 注册到主程序插件系统
    if (window.AlterPlugins) {
        AlterPlugins.register(bgSwitcher);
    }
})();
