import { fabric } from 'fabric'
export const RECT = {
  w: 140,
  h: 40,
  bgColor: ['#78c386', '#e48484', '#c28976'],// 语雀绘图的配色  绿=》红=》棕
  lineColor: '#69b1e4',
  textColor: 'white',
  fontSize: 16,
  origin: 'center',
  // infoBg:'#fce5a2',
  infoBg: '#595959',
  fontFamily: " Helvetica, 'Hiragino Sans GB', 'Microsoft Yahei', '微软雅黑', Arial, sans-serif"
}
function drawInfo() {
  const title = `✅ 前端必须要学的知识 需要练习
🔥 大圣推荐的技术，进阶必备，需要深入研究
⭐ 可以先收藏起来，用到的时候再学的技术
❌ 不推荐或者过时的技术`
  const x = 35
  const y = 50
  const width = 280
  const height = 100
  const { textColor, fontSize, origin, infoBg } = RECT
  const rect = new fabric.Rect({
    fill: infoBg,
    originX: origin,
    originY: origin,
    rx: '5',
    shadow: 'rgba(0,0,0,.2) 2px 2px 2px',
    width,
    height,
  })
  const text = new fabric.Text(title, {
    fill: textColor,
    originY: origin,
    originX: origin,
    fontWeight: '500',
    lineHeight: 1.5,
    fontSize: 12,
    fontFamily: RECT.fontFamily
  })
  const group = new fabric.Group([rect, text], {
    left: x,
    top: y,
    lockMovementX: true,
    lockMovementY: true
  })
  return group
}
function drawQrcode(canvas) {


  const title = `关注公众号，学习不迷路
来源:https://shengxinjing.cn
好好学习，天天向上`
  const x = 0
  const y = 50
  const width = 300
  const height = 100
  const { textColor, fontSize, origin } = RECT
  fabric.Image.fromURL('/qrcode.jpeg', img => {
    img.set({
      left: 810,
      top: 60,
      opacity: 0.8,
      scaleX: 0.32,
      scaleY: 0.32
    })

    const rect = new fabric.Rect({
      fill: RECT.infoBg,
      originX: origin,
      originY: origin,
      rx: '5',
      shadow: 'rgba(0,0,0,.2) 2px 2px 2px',
      width,
      height,
    })
    const text = new fabric.Text(title, {
      fill: textColor,
      left:15,
      originY: origin,
      originX: 'right',
      fontWeight: '500',
      lineHeight: 1.5,
      fontSize: 12,
      fontFamily: RECT.fontFamily
    })

    const group = new fabric.Group([rect, text], {
      left: 600,
      top: y,
      lockMovementX: true,
      lockMovementY: true
    })

    canvas.add(group)
    canvas.add(img)

  })


  return


  // canvas.add(group)
}

export function drawMap(dom, data) {
  const rects = []

  const lines = []
  let lastRect
  // data[0].y = data[0].y+130
  for (let i = 1; i < data.length; i++) {
    data[i].x = data[i - 1].x + (data[i].x || 0)
    data[i].y = data[i - 1].y + (data[i].y || 100)
  }
  let canvas = new fabric.Canvas(dom, {
    containerClass: 'roadmap-container',
    hoverCursor: 'pointer',
    interactive: false, //禁止交互
    selection: false
  })
  canvas.add(drawInfo())
  drawQrcode(canvas)

  data.forEach(item => {

    const rect = drawRect(item, canvas)
    rect.link = item.link
    rects.push(rect)

    if (lastRect) {
      lines.push(drawLine(lastRect, rect))
    }

    lastRect = rect

    const { left, right } = item
    traverse(rect, left, 'left', 1)
    traverse(rect, right, 'right', 1)

    function traverse(parent, children, direction, depth) {
      if (!children || !children.length) return

      if (typeof children == 'string') {
        children = [children]
      }
      children = children.map(child => c(...child))

      const len = children.length
      const isEven = !(len & 1) //是不是偶数
      children.filter(v => v).forEach((child, i) => {
        if (direction == 'left') {
          child.x = parent.left + child.x - 250 + depth * 45
        } else {
          child.x = parent.left + child.x + 272 - depth * 45
        }
        let y = child.y || (parent.top - (Math.floor(len / 2) - i) * (RECT.h + 10))
        y += isEven ? RECT.h / 2 : 0
        const subRect = drawRect({ ...child, y, depth }, canvas)
        subRect.link = child.link || parent.link

        rects.push(subRect)
        const l = direction == 'left' ? drawSubline(subRect, parent) : drawSubline(parent, subRect)
        lines.push(l)
        if (child.children) {
          traverse(subRect, child.children, direction, depth + 1)
        }
      })
    }

  })

  // rects.forEach(rect=>canvas.add(rect))
  lines.forEach(line => canvas.add(line))
  return canvas
}

function drawSubline(r1, r2) {
  // 两个rect的连线
  const sx = r1.left + r1.width
  const sy = r1.top + r1.height / 2
  let dx, dy
  if (r1.left > r2.left) {
    dx = r2.left - (r1.left - r2.left) / 2
    dy = r1.top + (r2.top - r1.top) / 2
  } else {
    dx = r1.left + (r2.left + r1.width - r1.left) / 2
    dy = r1.top + (r2.top - r1.top) / 2
  }

  const ex = r2.left
  const ey = r2.top + RECT.h / 2

  const line = new fabric.Path(`M ${sx} ${sy} S${dx},${dy},${ex},${ey}`, {
    fill: '',
    stroke: RECT.lineColor,
    strokeWidth: 2,
    strokeDashArray: [5, 5]
  })
  return line
}

function drawRect(item, canvas) {
  const tags = ['❌', '✅', '🔥', '⭐']

  let tag
  tags.forEach(t => {
    if (item.title.startsWith(t)) {
      item.title = item.title.replace(t, '')
      tag = t
    }
  })
  const { title, x, y, depth = 0 } = item
  const width = (item.w ? item.w : RECT.w) - depth * 15
  const height = item.h ? item.h : RECT.h
  const { textColor, bgColor, fontSize, origin } = RECT


  const rect = new fabric.Rect({
    fill: tag == '❌' ? RECT.infoBg : bgColor[depth],
    originX: 'origin',
    originY: origin,
    rx: '5',
    shadow: 'rgba(0,0,0,.2) 2px 2px 2px',
    width,
    height,
  })
  const text = new fabric.Text(title, {
    fill: textColor,
    originY: origin,
    originX: origin,
    fontWeight: '500',
    fontSize,
    fontFamily: RECT.fontFamily

  })

  const group = new fabric.Group([rect, text], {
    left: x,
    top: y,
    lockMovementX: true,
    lockMovementY: true
  })
  canvas.add(group)

  if (tag) {
    // const r = new fabric.Rect({
    //   fill: tag=='❌'?RECT.infoBg:bgColor[depth],
    //   originX:'origin',
    //   originY:origin,
    //   rx:'5',
    //   width:2,
    //   height:20,
    // })
    const t = new fabric.Text(tag, {
      fill: textColor,
      originY: origin,
      originX: origin,
      fontWeight: '500',
      fontSize: tag == '❌' ? 10 : 12,
      fontFamily: RECT.fontFamily

    })

    const g = new fabric.Group([t], {
      left: x <= 400 ? (x + 5) : (x + width - 15),
      top: y + 3,
      lockMovementX: true,
      lockMovementY: true
    })
    canvas.add(g)
    canvas.bringForward(g)

  }


  return group
}


let lineDirection = 'left'

function drawLine(r1, r2) {
  // 两个rect的连线
  const sx = r1.left + RECT.w / 2
  const sy = r1.top + RECT.h / 2

  const dx = lineDirection === 'left' ? r1.left - RECT.w / 3 : r1.left + RECT.w
  const dy = r1.top + (r2.top - r1.top) / 2

  const ex = r2.left + RECT.w / 2
  const ey = r2.top + RECT.h / 2

  const line = new fabric.Path(`M ${sx} ${sy} Q ${dx},${dy},${ex},${ey}`, {
    fill: '',
    stroke: RECT.lineColor,
    strokeWidth: 3
  })
  lineDirection = lineDirection === 'left' ? 'right' : 'left'
  line.globalCompositeOperation = 'destination-over'
  return line
}
export function c(title, options, children) {

  // [x,w,h]
  if (!options) {
    // only title
    options = []
    children = []
  } else if (!children) {
    if (typeof options[0] == 'number') {
      // title any options
      children = []
    } else {
      // title and children
      children = options
      options = []
    }

  }

  const [x = 0, w = 120, h = 40] = options
  const { bgColor, textColor } = RECT
  const ret = {
    title, x, w, h, bgColor, textColor, children
  }
  return ret
}