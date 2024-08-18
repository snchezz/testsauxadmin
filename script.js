$(document).ready(function () {
    const preguntasContainer = $('#preguntasContainer');
    const corregirBtn = $('#corregirBtn');
    const reiniciarBtn = $('#reiniciarBtn');
    const personalizadoOptions = $('#personalizadoOptions');
    const tipoExamenForm = $('#tipoExamenForm');
    const statsContent = $('#statsContent');
    const statsTableBody = $('#statsTableBody');
    const totalRespondidas = $('#totalRespondidas');
    const resetStatsBtn = $('#resetStatsBtn');
    const btnFloating = $('#btnFloating');

    // Inicializar modales
    $('.modal').modal();

    // Inicializar botón flotante
    $('.fixed-action-btn').floatingActionButton();

    // Manejar el botón flotante
    btnFloating.on('click', function () {
        const icon = $(this).find('.material-icons');
        if (icon.text() === 'add') {
            icon.text('info_outline');
            $(this).find('.btn-floating').removeClass('red').addClass('blue');
        } else {
            icon.text('insert_chart');
            $(this).find('.btn-floating').removeClass('blue').addClass('green');
        }
    });

    // Manejar la selección de tipo de examen
    $('input[name="tipoExamen"]').on('change', function () {
        if ($(this).val() === 'personalizado') {
            personalizadoOptions.show();
        } else {
            personalizadoOptions.hide();
        }
    });

    // Manejar el formulario de selección de examen
    tipoExamenForm.on('submit', function (e) {
        e.preventDefault();
        const tipoExamen = $('input[name="tipoExamen"]:checked').val();

        if (tipoExamen === 'normal') {
            generarPreguntasNormal();
        } else {
            const numLeyes = parseInt($('#numLeyes').val(), 10);
            const numPsicotecnico = parseInt($('#numPsicotecnico').val(), 10);
            const numBloqueII = parseInt($('#numBloqueII').val(), 10);
            generarPreguntasPersonalizado(numLeyes, numPsicotecnico, numBloqueII);
        }
        reiniciarBtn.show();
    });

    // Función para reiniciar el examen
    reiniciarBtn.on('click', function () {
        preguntasContainer.empty();
        corregirBtn.hide();
        reiniciarBtn.hide();
        $('#tipoExamenForm')[0].reset();
        $('#personalizadoOptions').hide();

        // Eliminar cualquier mensaje de puntuación anterior
        $('.puntuacion-final').remove();

        // Reiniciar estadísticas al reiniciar el examen
        resetEstadisticas();
    });

    // Generar preguntas para el Examen Normal
    function generarPreguntasNormal() {
        preguntasContainer.empty();
        corregirBtn.show().text("Corregir").prop('disabled', false);

        const preguntasLeyes = preguntas.filter(p => p.Categoria === 'Leyes').sort(() => Math.random() - 0.5).slice(0, 30);
        const preguntasPsicotecnico = preguntas.filter(p => p.Categoria === 'Psicotecnico').sort(() => Math.random() - 0.5).slice(0, 30);
        const preguntasBloqueII = preguntas.filter(p => p.Categoria === 'BloqueII').sort(() => Math.random() - 0.5).slice(0, 50);

        const preguntasSeleccionadas = [...preguntasLeyes, ...preguntasPsicotecnico, ...preguntasBloqueII];

        mostrarPreguntas(preguntasSeleccionadas);
    }

    // Generar preguntas para el Examen Personalizado
    function generarPreguntasPersonalizado(numLeyes, numPsicotecnico, numBloqueII) {
        preguntasContainer.empty();
        corregirBtn.show().text("Corregir").prop('disabled', false);

        const preguntasLeyes = preguntas.filter(p => p.Categoria === 'Leyes').sort(() => Math.random() - 0.5).slice(0, numLeyes);
        const preguntasPsicotecnico = preguntas.filter(p => p.Categoria === 'Psicotecnico').sort(() => Math.random() - 0.5).slice(0, numPsicotecnico);
        const preguntasBloqueII = preguntas.filter(p => p.Categoria === 'BloqueII').sort(() => Math.random() - 0.5).slice(0, numBloqueII);

        const preguntasSeleccionadas = [...preguntasLeyes, ...preguntasPsicotecnico, ...preguntasBloqueII];

        mostrarPreguntas(preguntasSeleccionadas);
    }

    // Mostrar preguntas en el contenedor
    function mostrarPreguntas(preguntasSeleccionadas) {
        preguntasSeleccionadas.forEach((pregunta, index) => {
            const imagenHtml = pregunta.Imagen !== "N/A" ?
                `<img src="IMG/${pregunta.Imagen}.png" alt="${pregunta.Imagen}" style="max-width:100%; margin-top: 15px;">` :
                "";

            const preguntaHtml = `
                <div class="card">
                    <div class="card-content">
                        <span class="card-title">Nº${index + 1}: ${pregunta.Cuestion} (Pregunta ${pregunta["Nº Pregunta"]} del ${pregunta.Año})</span>
                        ${imagenHtml}
                        <form class="opciones" style="margin-top: 15px;">
                            <p>
                                <label>
                                    <input name="pregunta${index}" type="radio" value="A" />
                                    <span>${pregunta["Respuesta A"]}</span>
                                </label>
                            </p>
                            <p>
                                <label>
                                    <input name="pregunta${index}" type="radio" value="B" />
                                    <span>${pregunta["Respuesta B"]}</span>
                                </label>
                            </p>
                            <p>
                                <label>
                                    <input name="pregunta${index}" type="radio" value="C" />
                                    <span>${pregunta["Respuesta C"]}</span>
                                </label>
                            </p>
                            <p>
                                <label>
                                    <input name="pregunta${index}" type="radio" value="D" />
                                    <span>${pregunta["Respuesta D"]}</span>
                                </label>
                            </p>
                        </form>
                        <a href="#" class="desmarcar-enlace" data-index="${index}" style="color: #ff6f00; margin-top: 10px; display: inline-block;">Desmarcar esta pregunta</a>
                    </div>
                </div>
            `;

            preguntasContainer.append(preguntaHtml);
        });

        // Manejar el clic en el enlace "Desmarcar esta pregunta"
        $(document).on('click', '.desmarcar-enlace', function (e) {
            e.preventDefault();
            const index = $(this).data('index');
            $(`input[name="pregunta${index}"]`).prop('checked', false);
        });



        corregirBtn.off('click').on('click', function () {
            corregirRespuestas(preguntasSeleccionadas);
        });
    }

    function corregirRespuestas(preguntasSeleccionadas) {
        let correctas = 0;
        let incorrectas = 0;
        let puntuacion = 0; // Variable para la puntuación total
        let preguntasPorCategoria = {
            'Leyes': { respondidas: 0, correctas: 0, fallidas: 0 },
            'Psicotecnico': { respondidas: 0, correctas: 0, fallidas: 0 },
            'BloqueII': { respondidas: 0, correctas: 0, fallidas: 0 }
        };

        // Eliminar cualquier mensaje de puntuación anterior
        $('.puntuacion-final').remove();

        $('.card').each(function (index) {
            const seleccionada = $(this).find('input[type="radio"]:checked').val();
            const correcta = preguntasSeleccionadas[index]["Respuesta Correcta"];
            const categoria = preguntasSeleccionadas[index].Categoria;

            $(this).removeClass('correcta incorrecta no-respondida');

            if (seleccionada === undefined) {
                // Pregunta no respondida, resaltarla y mostrar la respuesta correcta
                $(this).addClass('no-respondida').css('background-color', '#FFE5A0');

                // Mostrar la opción correcta
                $(this).find('.opciones').after(`
                    <div class="respuesta-correcta">
                        <p><strong>Respuesta correcta:</strong> ${correcta} - ${preguntasSeleccionadas[index]["Respuesta " + correcta]}</p>
                    </div> 
                `);
                return;
            }

            if (seleccionada === correcta) {
                $(this).addClass('correcta');
                correctas++;
                puntuacion += 1; // Sumar 1 punto por respuesta correcta
                preguntasPorCategoria[categoria].respondidas++;
                preguntasPorCategoria[categoria].correctas++;
            } else {
                $(this).addClass('incorrecta');
                incorrectas++;
                puntuacion -= 1 / 3; // Restar 1/3 de punto por respuesta incorrecta
                preguntasPorCategoria[categoria].respondidas++;
                preguntasPorCategoria[categoria].fallidas++;

                // Mostrar la opción correcta
                $(this).find('.opciones').after(`
                    <div class="respuesta-correcta">
                        <p><strong>Respuesta correcta:</strong> ${correcta} - ${preguntasSeleccionadas[index]["Respuesta " + correcta]}</p>
                    </div>
                `);
            }
        });

        // Mostrar la puntuación final, asegurando que solo haya un mensaje
        corregirBtn.after(`
            <div class="puntuacion-final">
                <h5>Puntuación final: ${puntuacion.toFixed(2)}</h5>
            </div>
        `);

        if (correctas > 0 || incorrectas > 0) {
            corregirBtn.text("Examen Corregido").prop('disabled', true);
        } else {
            corregirBtn.text("Intenta de nuevo");
        }

        actualizarEstadisticas(correctas, incorrectas, preguntasPorCategoria);
    }


    // Actualizar estadísticas
    function actualizarEstadisticas(correctas, incorrectas, preguntasPorCategoria) {
        const stats = JSON.parse(localStorage.getItem('estadisticas')) || {
            totalIntentos: 0,
            correctas: 0,
            incorrectas: 0,
            categorias: {
                'Leyes': { respondidas: 0, correctas: 0, fallidas: 0 },
                'Psicotecnico': { respondidas: 0, correctas: 0, fallidas: 0 },
                'BloqueII': { respondidas: 0, correctas: 0, fallidas: 0 }
            }
        };

        if (correctas > 0 || incorrectas > 0) {
            stats.totalIntentos += 1;
            stats.correctas += correctas;
            stats.incorrectas += incorrectas;

            for (const categoria in preguntasPorCategoria) {
                if (preguntasPorCategoria.hasOwnProperty(categoria)) {
                    stats.categorias[categoria].respondidas += preguntasPorCategoria[categoria].respondidas;
                    stats.categorias[categoria].correctas += preguntasPorCategoria[categoria].correctas;
                    stats.categorias[categoria].fallidas += preguntasPorCategoria[categoria].fallidas;
                }
            }

            localStorage.setItem('estadisticas', JSON.stringify(stats));
        }

        // Mostrar las estadísticas en el modal
        $('#totalRespondidas').text(
            stats.categorias.Leyes.respondidas +
            stats.categorias.Psicotecnico.respondidas +
            stats.categorias.BloqueII.respondidas
        );
        $('#totalIntentos').text(stats.totalIntentos);
        $('#totalCorrectas').text(stats.correctas);
        $('#totalIncorrectas').text(stats.incorrectas);

        statsTableBody.html(`
            <tr>
                <td>Leyes</td>
                <td>${stats.categorias.Leyes.respondidas}</td>
                <td>${stats.categorias.Leyes.correctas}</td>
                <td>${stats.categorias.Leyes.fallidas}</td>
            </tr>
            <tr>
                <td>Psicotecnico</td>
                <td>${stats.categorias.Psicotecnico.respondidas}</td>
                <td>${stats.categorias.Psicotecnico.correctas}</td>
                <td>${stats.categorias.Psicotecnico.fallidas}</td>
            </tr>
            <tr>
                <td>BloqueII</td>
                <td>${stats.categorias.BloqueII.respondidas}</td>
                <td>${stats.categorias.BloqueII.correctas}</td>
                <td>${stats.categorias.BloqueII.fallidas}</td>
            </tr>
        `);
    }

    // Reiniciar estadísticas
    function resetEstadisticas() {
        localStorage.removeItem('estadisticas');
        actualizarEstadisticas(0, 0, {
            'Leyes': { respondidas: 0, correctas: 0, fallidas: 0 },
            'Psicotecnico': { respondidas: 0, correctas: 0, fallidas: 0 },
            'BloqueII': { respondidas: 0, correctas: 0, fallidas: 0 }
        });
    }

    resetStatsBtn.on('click', resetEstadisticas);

});