from pathlib import Path
import re, html
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image, PageBreak, KeepTogether
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.pagesizes import A4
from PIL import Image as PILImage
root=Path.cwd(); src=root/'docs/submission/PRODUCT_PLAN.md'; out=root/'output/pdf/知遇一席_产品说明计划书.pdf'
pdfmetrics.registerFont(TTFont('YaHei','C:/Windows/Fonts/msyh.ttc'))
pdfmetrics.registerFont(TTFont('YaHeiBold','C:/Windows/Fonts/msyhbd.ttc'))
pdfmetrics.registerFontFamily('YaHei',normal='YaHei',bold='YaHeiBold')
INK=colors.HexColor('#17232d'); GREEN=colors.HexColor('#324e43'); AMBER=colors.HexColor('#b8771d'); PAPER=colors.HexColor('#fcfaf5'); LINE=colors.HexColor('#dcd6c7')
styles={
 'body':ParagraphStyle('Body',fontName='YaHei',fontSize=10.6,leading=17.7,textColor=INK,spaceAfter=10,wordWrap='CJK'),
 'h1':ParagraphStyle('H1',fontName='YaHeiBold',fontSize=23,leading=31,textColor=GREEN,spaceAfter=22,wordWrap='CJK'),
 'h2':ParagraphStyle('H2',fontName='YaHeiBold',fontSize=13,leading=20,textColor=GREEN,spaceBefore=8,spaceAfter=9,wordWrap='CJK'),
 'small':ParagraphStyle('Small',fontName='YaHei',fontSize=8.9,leading=14,textColor=GREEN,spaceAfter=7,wordWrap='CJK'),
 'cell':ParagraphStyle('Cell',fontName='YaHei',fontSize=9.1,leading=14.2,textColor=INK,wordWrap='CJK'),
 'head':ParagraphStyle('Head',fontName='YaHeiBold',fontSize=9.3,leading=14,textColor=colors.white,wordWrap='CJK'),
 'cover':ParagraphStyle('Cover',fontName='YaHeiBold',fontSize=38,leading=49,textColor=GREEN,spaceAfter=12,wordWrap='CJK'),
}
def markup(s):
 s=html.escape(s)
 s=re.sub(r'\*\*(.+?)\*\*',r'<b>\1</b>',s)
 s=re.sub(r'(https://[^\s<>]+)',r'<link href="\1" color="#326256">\1</link>',s)
 return s
def p(s,style='body'): return Paragraph(markup(s),styles[style])
def table(lines):
 rows=[[x.strip() for x in line.strip().strip('|').split('|')] for line in lines]
 rows=[r for r in rows if not all(re.fullmatch(r'[:\- ]+',v) for v in r)]
 widths=[118,389] if len(rows[0])==2 else [74,193,240]
 cells=[[p(v,'head' if ri==0 else 'cell') for v in row] for ri,row in enumerate(rows)]
 t=Table(cells,colWidths=widths,repeatRows=1,hAlign='LEFT')
 t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),GREEN),('BACKGROUND',(0,1),(-1,-1),colors.HexColor('#f2eee4')),('GRID',(0,0),(-1,-1),0.5,LINE),('VALIGN',(0,0),(-1,-1),'TOP'),('LEFTPADDING',(0,0),(-1,-1),10),('RIGHTPADDING',(0,0),(-1,-1),10),('TOPPADDING',(0,0),(-1,-1),8),('BOTTOMPADDING',(0,0),(-1,-1),8)]))
 return t
def draw_page(c,doc):
 w,h=A4;c.setFillColor(PAPER);c.rect(0,0,w,h,fill=1,stroke=0)
 c.setFillColor(GREEN);c.rect(0,h-12,w,12,fill=1,stroke=0)
 c.setFont('YaHei',8);c.setFillColor(GREEN);c.drawString(44,h-37,'知遇·一席  /  知乎黑客松 2026 · 校园新锐季')
 c.setStrokeColor(LINE);c.line(44,42,w-44,42);c.setFont('YaHei',8);c.drawString(44,28,'知乎有你一席  ·  杨骐瑞  ·  湖北师范大学');c.drawRightString(w-44,28,f'{doc.page:02d}')
blocks=re.split(r'\n---\s*\n',src.read_text(encoding='utf-8-sig'));story=[]
for bi,block in enumerate(blocks):
 lines=block.strip().splitlines();i=0
 while i<len(lines):
  line=lines[i].strip()
  if not line:i+=1;continue
  if line.startswith('|'):
   group=[]
   while i<len(lines) and lines[i].strip().startswith('|'):group.append(lines[i]);i+=1
   story.extend([table(group),Spacer(1,14)]);continue
  if line.startswith('!['):
   path=re.search(r'\]\((.+)\)',line).group(1);imgpath=(src.parent/path).resolve();iw,ih=PILImage.open(imgpath).size;im=Image(str(imgpath),width=507,height=507*ih/iw);story.extend([Spacer(1,8),im,Spacer(1,14)])
  elif line.startswith('# '):story.append(p(line[2:],'cover' if bi==0 else 'h1'))
  elif line.startswith('## '):story.append(p(line[3:],'h2'))
  else:story.append(p(line,'small' if bi==0 and ('版本' in line or '浏览器' in line) else 'body'))
  i+=1
 if bi<len(blocks)-1:story.append(PageBreak())
doc=SimpleDocTemplate(str(out),pagesize=A4,rightMargin=44,leftMargin=44,topMargin=65,bottomMargin=57,title='知遇·一席 - 产品说明计划书',author='知乎有你一席 · 杨骐瑞',pageCompression=1)
doc.build(story,onFirstPage=draw_page,onLaterPages=draw_page)
from pypdf import PdfReader
reader=PdfReader(out);print({'file':str(out),'pages':len(reader.pages),'bytes':out.stat().st_size,'missing_text_pages':[i+1 for i,x in enumerate(reader.pages) if not x.extract_text().strip()]})
