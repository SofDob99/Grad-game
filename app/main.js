window.onload = () => {

	//-----------------------------------------------------------DRAGDROP INICIO

	const position = { x: 0, y: 0 }

	interact('.draggable').draggable({
		listeners: {
			start(event) {
				console.log(event.type, event.target)
			},
			move(event) {
				position.x += event.dx
				position.y += event.dy

				event.target.style.transform =
					`translate(${position.x}px, ${position.y}px)`
			},
		}
	})
	//------------------------------------------------------------ RULES CHANGE
	let imgActual = 0;
	let miniaturas = document.querySelectorAll('.mini');
	
	miniaturas.forEach(item => {
		item.addEventListener('click', () => {
			imgActual = item.dataset.num;
			cambioimagen(miniaturas[imgActual]);
		})
	})
	
	let cambioimagen = (item) => {
		let imagengrande = document.querySelector("#caja");
		imagengrande.src = item.src;
		imagengrande.alt = item.alt;
	};
	
	let btnizq = document.querySelector("#izquierda");
	btnizq.addEventListener("click", () => {
	
		if (imgActual == 0) {
			imgActual = 7
		} else {
			imgActual--;
		}
		cambioimagen(miniaturas[imgActual]);
	})
	
	let btnDerch = document.querySelector("#derecha");
	btnDerch.addEventListener("click", () => {
		if (imgActual == 7) {
			imgActual = 0
	
		} else {
			imgActual++;
		}
		cambioimagen(miniaturas[imgActual]);
	})




}