# La Isla de los Ecos
Aventura de acción para navegador de Sebastián Beltrán. Los súbditos del Rey Mimético recuerdan cómo peleas. Cuando llegas al trono, el Rey ya ha estudiado tus combates.

## Arquitectura y recorrido
| Módulo | Responsabilidad |
|---|---|
| index.html, style.css | Portada, manual, HUD de vida y energía, equipo, pausa y desenlaces |
| engine.js | Simulación, exploración, contacto, transición, combate, botín y reaparición |
| game.js | Entrada, bucle de pantalla, HUD, menús y guardado local |
| art.js | Dibujo pixelado del HUD, iconos e indicadores |
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
[Mapas de Mario & Luigi: Superstar Saga para GBA](https://www.spriters-resource.com/game_boy_advance/mlss/asset/861/). Los personajes, música y escenarios de este proyecto son originales.


## Jugar y verificar
Desde la raíz, ejecutar `python -m http.server 8000` y abrir http://localhost:8000. No requiere instalación de paquetes. Con Node 22.7 o posterior, ejecutar `node --test tests/adventure.test.mjs` para verificar el recorrido, la memoria, la curación y el reinicio.

WASD o flechas para caminar, J para atacar y abrir cofres cercanos, espacio para esquivar, Q para escoger arma, R para escoger objeto y E para usarlo. Esc abre la pausa. El atlas muestra las conexiones de cada región. El códice explica las predicciones y su acierto acumulado.
## La isla habitada
Cada región tiene un terreno de 1344 × 608 con cámara libre de seguimiento, dos cruces de río, caminos secundarios, tres habitantes, una patrulla opcional y dos hallazgos. El indicador J permite hablar, entrar al edificio señalado, usar su servicio, examinar objetos y abrir cofres. La posada cura, la botica entrega fruta, el archivo enseña a esquivar la onda y la armería repara un escudo. El minimapa indica el héroe, el edificio principal, el cofre y el guardián.

Bramble tiene 100 PV, Lumbre 165, Talos 250 y el Rey 460. Cada uno de los tres sellos aumenta en 15 la vida máxima del viajero. Las patrullas opcionales entregan suministros y transmiten sus observaciones al mismo predictor. Las jabalinas siguen una línea, las cuchillas se abren en abanico, el sable barre un sector y el martillo emite una onda expansiva. El Rey cambia su repertorio al llegar a media vida.

El archivo world.js describe geometría, colisiones y lugares de interés. village-art.js dibuja los pueblos y sus interiores, atlas.js carga las ilustraciones originales y arsenal.js simula proyectiles, áreas de impacto y patrones de ataque. weapon-art.js dibuja sus avisos y armas. Las partidas anteriores conservan sellos, equipo y memoria al migrar las coordenadas.

### Referencias de diseño
- [Beanbean Castle Town](https://www.mariowiki.com/Beanbean_Castle_Town) inspiró los establecimientos con funciones diferentes y sus habitantes.
- [Chuck Guy](https://www.mariowiki.com/Chuck_Guy) sirvió de referencia para comunicar un golpe mediante la postura y el arma del enemigo.
## Presentación de personajes y escenarios
El viajero usa poses de marcha, golpe, rodar, daño, respiración y curación. Los residentes tienen poses para caminar y hablar. Los guardianes preparan su arma y descargan el ataque con dibujos diferentes. actors.js selecciona el fotograma a partir del estado real de la simulación. Los atlas contienen fotogramas ya preparados al tamaño de exploración y de combate. El último escalado usa el tamaño físico de la pantalla y vecino más cercano.

Las bifurcaciones comparten una máscara de suelo con texturas por bioma. Los cuatro interiores y las cuatro arenas disponen de fondos completos. speech.js sigue al interlocutor y coloca el globo sobre su cabeza. J cierra el globo, y alejarse también lo oculta.