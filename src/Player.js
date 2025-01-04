import {
	Mesh,
	AnimationMixer
} from 'three';
import { Stuff } from './Stuff';

export class Player {
	constructor(info) {
		this.moving = false; 

		info.gltfLoader.load(
			info.modelSrc,
			glb => {
				// 메쉬의 그림자
				glb.scene.traverse(child => {
					if (child.isMesh) {
						child.castShadow = true;
					}
				});
		
				this.modelMesh = glb.scene.children[0];
				this.modelMesh.position.y = 0.3;
				this.modelMesh.rotation.set(
                    this.rotationX,
                    this.rotationY,
                    this.rotationZ
                );
				
				this.modelMesh.name = 'gamza';
				info.scene.add(this.modelMesh);
				info.meshes.push(this.modelMesh);

				this.actions = [];
		
				this.mixer = new AnimationMixer(this.modelMesh);
				this.actions[0] = this.mixer.clipAction(glb.animations[0]);
				this.actions[1] = this.mixer.clipAction(glb.animations[1]);
				// this.actions[0].play();
			}
		);
	}
}
