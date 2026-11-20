# La Isla de los Ecos
Aventura de acción para navegador de Sebastián Beltrán. Los súbditos del Rey Mimético recuerdan cómo peleas. Cuando llegas al trono, el Rey ya ha estudiado tus combates.

## Arquitectura y recorrido
| Módulo | Responsabilidad |
|---|---|
| index.html, style.css | Portada, manual, HUD de vida y energía, equipo, pausa y desenlaces |
| game.js | Bucle de simulación, entrada, exploración, contacto, transición, arena, retorno, guardado |
| art.js | Escenarios rasterizados por bioma, cámara y personajes animados en celdas de 128 × 128 |
| learning.js | Historial de acciones, predictor N-gram con contexto y memoria compartida |
| audio.js | Secuenciador Web Audio y muestras opcionales |
| assets/ | Ilustración de portada y tipografía pixelada |
| tests/ | Pruebas de aprendizaje y recorrido |
 
La pradera llega al bosque y a las ruinas. Ambos caminos llegan al castillo. Cada zona define terreno, paleta, accesorios, encuentros y puertas. Al contacto guardamos zona y posición, cerramos la pantalla en bandas y abrimos una arena del mismo bioma. Al vencer, el encuentro desaparece y se recupera la posición de entrada con el botín. Derrotar a tres guardianes abre el trono.
 
## Aprendizaje en línea
Cada acción voluntaria se codifica como ataque con arma y sector, esquive cardinal o curación. Se cuentan transiciones de orden 0, 1 y 2, con distancia y salud como contexto. Las observaciones recientes pesan más. El predictor usa contextos con evidencia suficiente y retrocede a contextos más amplios con pocos ejemplos. Medimos el acierto con la predicción emitida **antes** de incorporar la acción real. La memoria persiste en el navegador. Las intenciones enemigas se fijan durante una anticipación visible y se pueden engañar con humo. El códice muestra muestras, hábito y precisión.
 
## Arte y audio
La captura de referencia usa cámara de tres cuartos, contorno oscuro, objetos que muestran tapa y frente, suelo cálido y paredes frías. La isla adapta esa lectura a vegetación turquesa, caminos ocres y sombras cortas. Sprites originales con poses de marcha, ataque, esquive, daño y curación. La portada funciona como ilustración de la isla. El audio usa composiciones y timbres propios para exploración, combate y trono, con control de volumen. 
 
## Equipo
Espada de Viajero inicial, Espada de Caballero balanceada, Dagas del Viento de corto alcance, Martillo del Ocaso lento y Espada Rúnica de gran alcance. La fruta tarda en curar. Escudo, bomba aturdidora, elixir y humo cambian las opciones en tiempo real.
 
## Fases
1. Motor, mapa y HUD.
2. Encuentros y arenas en tiempo real.
3. Armas, consumibles y predictor.
4. Rey Mimético, audio, pruebas y despliegue en Vercel.

## Referencia de exploración
[Mapas de Mario & Luigi: Superstar Saga para GBA](https://pixelguides.org/mario-and-luigi-superstar-saga/). Los personajes, música y escenarios de este proyecto son originales.
