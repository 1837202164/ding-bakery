import * as THREE from 'three';

const loader = new THREE.TextureLoader();

function loadTex(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      reject,
    );
  });
}

/** 面向相机的立绘板（Q 版贴图） */
export function createArtBillboard(
  textureUrl: string,
  width: number,
  height: number,
  onReady?: () => void,
): THREE.Group {
  const group = new THREE.Group();
  const geo = new THREE.PlaneGeometry(width, height);
  const mat = new THREE.MeshBasicMaterial({
    transparent: true,
    depthWrite: false,
    opacity: 0,
    side: THREE.DoubleSide,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = height * 0.5;
  group.add(mesh);
  group.userData.isArtBillboard = true;

  void loadTex(textureUrl)
    .then((tex) => {
      mat.map = tex;
      mat.opacity = 1;
      mat.needsUpdate = true;
      onReady?.();
    })
    .catch(() => {
      // 贴图缺失时保持透明
    });

  return group;
}

/** 仅运行时实际加载的路径；概念图 / 六视面在 art/ 母版，不进 public */
export const ArtPaths = {
  clerk: '/art/characters/clerk-front.png',
  customerPink: '/art/characters/customer-pink.png',
  customerBlue: '/art/characters/customer-blue.png',
  customerYellow: '/art/characters/customer-yellow.png',
  customerMint: '/art/characters/customer-mint.png',
  customerDenim: '/art/characters/customer-denim.png',
  customerKid: '/art/characters/customer-kid.png',
} as const;

/** 客人立绘池（刷客时轮换） */
export const CustomerArtPool = [
  ArtPaths.customerPink,
  ArtPaths.customerBlue,
  ArtPaths.customerYellow,
  ArtPaths.customerMint,
  ArtPaths.customerDenim,
  ArtPaths.customerKid,
] as const;
