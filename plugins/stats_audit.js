/**
 * 插件：深空沉浸模式 (Deep Space Mode)
 * 功能：切换极简全黑背景。
 */
(function() {
    let isImmersive = false;
    const spaceMode = {
        name: "深空沉浸切换",
        author: "Alter OpenSource",
        run: function() {
            if (!isImmersive) {
                document.body.style.filter = "invert(1) hue-rotate(180deg)";
                AlterAPI.showMsg("进入深空沉浸模式");
            } else {
                document.body.style.filter = "none";
                AlterAPI.showMsg("回归标准视野");
            }
            isImmersive = !isImmersive;
        }
    };
    if (window.AlterPlugins) AlterPlugins.register(spaceMode);
})();
