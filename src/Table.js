export class Table {
	constructor(info) {
		this.x = info.x;
		this.y = info.y;
		this.z = info.z;

		this.visible = false; 

		info.gltfLoader.load(
			info.modelSrc,
			glb => {
                // 그림자 설정
                glb.scene.traverse(child => {
					if (child.isMesh) {
						child.castShadow = true;
					}
				});

				this.modelMesh = glb.scene.children[0];
				// this.modelMesh.castShadow = true;
				this.modelMesh.position.set(this.x, this.y, this.z);
                // this.modelMesh.scale.set(3, 4, 3);
				this.modelMesh.scale.set(this.scaleX, this.scaleY, this.scaleZ);

				// this.modelMesh.rotation.set(
                //     this.rotationX,
                //     this.rotationY,
                //     this.rotationZ
                // )
				info.scene.add(this.modelMesh);
			}
		);
	}
}
