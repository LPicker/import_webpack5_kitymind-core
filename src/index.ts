import "kity"
import "../kityminderCore/expose-kityminder"
import "./style.css"

console.log("kityminder-core 加载成功了")

window.onload = evt => {
  // @ts-ignore
  const km = new window.kityminder.Minder({
    renderTo: "body",
  })

  const data = {
    root: {
      data: {
        id: "1",
        text: "中心主题",
        dir: "right",
        layout: null,
      },
      children: [
        {
          data: {
            id: "1-1",
            text: "分支主题",
            dir: "right",
            layout: null,
          },
        },
        {
          data: {
            id: "1-2",
            text: "分支主题",
            dir: "right",
            layout: null,
          },
        },
      ],
    },
    template: "default",
    version: "1.4.43",
  } as any

  km.importData("json", JSON.stringify(data))
  // km.importJson(data)
}
