"""Make the ILLUSTRATIVE edited copy of the real verified capture.
Hand-made with OpenCV inpainting, no generator. Input stays untouched.
Edits: race decals (roundel, F number, sawtooth stripe) and the tyre-brand text
removed, roof chips smoothed, paint made glossier and newer-looking."""
import cv2, numpy as np, os
here=os.path.dirname(os.path.abspath(__file__))
src=os.path.join(here,'assets','car-verified-capture.jpg')
im=cv2.imread(src); h,w=im.shape[:2]
mask=np.zeros((h,w),np.uint8)
rng=np.random.default_rng(7)
out=im.astype(np.float32).copy()
hp=(im.astype(np.float32)-cv2.GaussianBlur(im,(0,0),1.5).astype(np.float32))
patch=hp[600:640,560:640]  # clean fender paint grain
grain=np.tile(patch,(h//40+1,w//80+1,1))[:h,:w]
# decal regions (orig px, found by zoom inspection): roundel+sawtooth+F plate, then tyre-brand text.
# Fill each row by linear interpolation between clean paint just outside the region, plus real grain.
def fill(x0,x1,y0,y1):
    for y in range(y0,y1):
        L=im[y,x0-6:x0-2].astype(np.float32).mean(0); R=im[y,x1+2:x1+6].astype(np.float32).mean(0)
        t=np.linspace(0,1,x1-x0)[:,None]
        out[y,x0:x1]=L*(1-t)+R*t+grain[y, x0:x1]*0.9
        mask[y,x0:x1]=255
fill(366,576,658,700)
fill(366,548,700,742)
fill(250,346,683,709)
out=out.clip(0,255).astype(np.uint8)
# soften the seams of the filled regions only
seam=cv2.GaussianBlur(out,(0,0),1.6); mf=(cv2.GaussianBlur(mask,(0,0),2)/255.0)[...,None]
edge=np.clip(mf*(1-mf)*4,0,1)
out=(out*(1-edge)+seam*edge).astype(np.uint8)
# whole car silhouette: blue-ish pixels, closed and hole-filled
hsv2=cv2.cvtColor(out,cv2.COLOR_BGR2HSV)
body=((hsv2[...,0]>88)&(hsv2[...,0]<132)&(hsv2[...,1]>28)).astype(np.uint8)*255
body=cv2.morphologyEx(body,cv2.MORPH_CLOSE,np.ones((31,31),np.uint8))
cs,_=cv2.findContours(body,cv2.RETR_EXTERNAL,cv2.CHAIN_APPROX_SIMPLE)
body=np.zeros_like(body); cv2.drawContours(body,[max(cs,key=cv2.contourArea)],-1,255,-1)
body=cv2.erode(body,np.ones((5,5),np.uint8))
bf=(cv2.GaussianBlur(body,(0,0),3)/255.0)[...,None]
smooth=cv2.bilateralFilter(cv2.medianBlur(out,5),9,35,9)
g=cv2.cvtColor(smooth,cv2.COLOR_BGR2HSV).astype(np.float32)
g[...,1]=np.clip(g[...,1]*1.45,0,255); g[...,2]=np.clip(g[...,2]*1.10+8,0,255)
gloss=cv2.cvtColor(g.astype(np.uint8),cv2.COLOR_HSV2BGR).astype(np.float32)
yy,xx=np.mgrid[0:h,0:w]
band=np.exp(-((yy+0.25*xx-640)/18.0)**2)[...,None]*0
gloss=np.clip(gloss+band,0,255)
res=(out.astype(np.float32)*(1-bf)+gloss*bf).astype(np.uint8)
cv2.imwrite(os.path.join(here,'assets','car-EDITED-illustration.jpg'),res,[cv2.IMWRITE_JPEG_QUALITY,94])
cv2.imwrite(os.path.join(here,'..','refs','edit-mask.png'),mask)
# side-by-side zoom for inspection
z=np.hstack([im[400:780],res[400:780]])
cv2.imwrite(os.path.join(here,'..','refs','edit-before-after-zoom.png'),z)
print('ok',int(mask.sum()/255),'px masked')
