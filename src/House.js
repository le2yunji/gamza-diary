import * as THREE from 'three';

export class House {
	constructor(info) {
		this.x = info.x;
		this.y = info.y;
		this.z = info.z;

		this.rotationX = info.rotationX || 0; 
		this.rotationY = info.rotationY || 0; 
		this.rotationZ = info.rotationZ || 0;

		this.visible = false; 

		info.gltfLoader.load(
			info.modelSrc,
			glb => {

				glb.scene.traverse(child => {
					if (child.isMesh) {
						child.castShadow = true;
					}
				});
				
				this.modelMesh = glb.scene.children[0];
				this.modelMesh.castShadow = true;
				this.modelMesh.position.set(this.x, this.y, this.z);
				
				// 회전 설정
				// this.modelMesh.rotation.set(
				// 	THREE.MathUtils.degToRad(this.rotationX),
				// 	THREE.MathUtils.degToRad(this.rotationY),
				// 	THREE.MathUtils.degToRad(this.rotationZ)
				// );

				info.scene.add(this.modelMesh);
				
			}
		);
	}
}
