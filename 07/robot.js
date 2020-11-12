function addLimb(color) {
	var helper = HELPER.cylinderSkeletonMesh(3, 5, color);
	var [geometry, material, bones] = [helper[0], helper[1], helper[2]];

	var mesh = new THREE.SkinnedMesh(geometry, material);
	var skeleton = new THREE.Skeleton(bones);
	mesh.add(bones[0]);
	mesh.bind(skeleton);

	return { bones, mesh };
}

function randRange(min, max) {
    return Math.random() * (max - min) + min;
}

Robot = function Robot(x, y, z) {
	this.base_x = x;
	this.base_y = y;
	this.base_z = z;

	// head, neck, and torso
	var body = addLimb('#171717');
	this.root = body.bones[0];
	this.root.position.set(x, y, z);

	this.head = body.bones[1];

	var t = new THREE.VideoTexture(document.querySelector('video'));
	var m = new THREE.MeshPhongMaterial({ map: t });
	var g = new THREE.BoxBufferGeometry(25, 25, 25);
	face = new THREE.Mesh(g, m);
	face.position.y = -10;
	this.head.add(face);

	this.neck = body.bones[2];
	this.neck.position.y = -10;

	this.torso = body.bones[3];
	this.torso.position.y = -30;

	this.body_mesh = body.mesh;

	// left arm
	var left_arm = addLimb('#171717');
	this.neck.add(left_arm.bones[0]);

	this.left_upper_arm = left_arm.bones[1];
	this.left_upper_arm.position.x = 5;
	this.left_upper_arm.position.y = -5;

	this.left_lower_arm = left_arm.bones[2];
	this.left_lower_arm.position.x = 5;
	this.left_lower_arm.position.y = -15;

	this.left_hand = left_arm.bones[3];
	this.left_hand.position.x = 5;
	this.left_hand.position.y = -5;

	this.left_arm_mesh = left_arm.mesh;

	// right arm
	var right_arm = addLimb('#171717');
	this.neck.add(right_arm.bones[0]);

	this.right_upper_arm = right_arm.bones[1];
	this.right_upper_arm.position.x = -5;
	this.right_upper_arm.position.y = -5;

	this.right_lower_arm = right_arm.bones[2];
	this.right_lower_arm.position.x = -5;
	this.right_lower_arm.position.y = -15;

	this.right_hand = right_arm.bones[3];
	this.right_hand.position.x = -5;
	this.right_hand.position.y = -5;

	this.right_arm_mesh = right_arm.mesh;

	// left leg
	var left_leg = addLimb('#171717');
	this.torso.add(left_leg.bones[0]);

	this.left_upper_leg = left_leg.bones[1];
	this.left_upper_leg.position.x = 10;
	this.left_upper_leg.position.y = -15;

	this.left_lower_leg = left_leg.bones[2];
	this.left_lower_leg.position.x = 5;
	this.left_lower_leg.position.y = -15;

	this.left_foot = left_leg.bones[3];
	this.left_foot.position.x = 5;
	this.left_foot.position.y = -5;

	this.left_leg_mesh = left_leg.mesh;

	// right leg
	var right_leg = addLimb('#171717');
	this.torso.add(right_leg.bones[0]);

	this.right_upper_leg = right_leg.bones[1];
	this.right_upper_leg.position.y = -15;
	this.right_upper_leg.position.x = -10;

	this.right_lower_leg = right_leg.bones[2];
	this.right_lower_leg.position.y = -15;
	this.right_lower_leg.position.x = -5;

	this.right_foot = right_leg.bones[3];
	this.right_foot.position.y = -5;
	this.right_foot.position.x = -5;

	this.right_leg_mesh = right_leg.mesh;
}

Robot.prototype.show = function() {
	scene.add(this.body_mesh);
	scene.add(this.left_arm_mesh);
	scene.add(this.right_arm_mesh);
	scene.add(this.left_leg_mesh);
	scene.add(this.right_leg_mesh);

	this.movement = null;
}

var movements = ['left_raise_arm', 'left_lower_arm', 'right_raise_arm', 'right_lower_arm', 'left_kick', 'right_kick'];

var T = Math.PI;
var arm = new THREE.Quaternion(Math.sin(T/2), 0, 0, Math.cos(T/2));
var leg = new THREE.Quaternion(-Math.sin(T/2), 0, 0, Math.cos(T/2));
var reset = new THREE.Quaternion(0, 0, 0, 1);

let dancing = false;

Robot.prototype.raiseLeftArm  = function() { this.movement = 'left_raise_arm' }
Robot.prototype.lowerLeftArm  = function() { this.movement = 'left_lower_arm' }
Robot.prototype.raiseRightArm = function() { this.movement = 'right_raise_arm' }
Robot.prototype.lowerRightArm = function() { this.movement = 'right_lower_arm' }
Robot.prototype.leftKick      = function() { this.movement = 'left_kick' }
Robot.prototype.rightKick     = function() { this.movement = 'right_kick' }
Robot.prototype.dance         = function() {
	if (!dancing) {
		dancing = true;

		var discoball = document.getElementById('discoball');
		discoball.style.visibility = 'visible';

		d = setInterval(function() {
			for (i in robots) {
				robots[i].movement = movements[Math.floor(Math.random() * movements.length)];
				var shake = randRange(-3, 3);
				robots[i].root.position.x += shake;
				robots[i].root.position.z += shake;
			}
		}, 400);
	}
}

Robot.prototype.onAnimate = function() {
	switch(this.movement) {
		case 'left_raise_arm':
			this.left_upper_arm.quaternion.slerp(arm, 0.1);
			break;

		case 'left_lower_arm':
			this.left_upper_arm.quaternion.slerp(reset, 0.1);
			break;

		case 'right_raise_arm':
			this.right_upper_arm.quaternion.slerp(arm, 0.1);
			break;

		case 'right_lower_arm':
			this.right_upper_arm.quaternion.slerp(reset, 0.1);
			break;

		case 'left_kick':
			if (this.left_upper_leg.quaternion.w < 0.72)
				this.movement = 'left_kicked';
			else
				this.left_upper_leg.quaternion.slerp(leg, 0.1);
			break;

		case 'left_kicked':
			this.left_upper_leg.quaternion.slerp(reset, 0.1);
			break;

		case 'right_kick':
			if (this.right_upper_leg.quaternion.w < 0.72)
				this.movement = 'right_kicked';
			else
				this.right_upper_leg.quaternion.slerp(leg, 0.1);
			break;

		case 'right_kicked':
			this.right_upper_leg.quaternion.slerp(reset, 0.1);
			break;
	}
}