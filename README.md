# English Prepositions Games

Interactive A1 English-learning website by **Katerina Zhuchkova**.

The project contains three complete browser games:

1. **Sentence Builder** — build a sentence from four parts.
2. **Picture Shooter** — choose the picture that matches the preposition.
3. **Type the Preposition** — type the missing preposition.

## Vocabulary

`in`, `on`, `under`, `behind`, `next to`, `in front of`, `between`, `near`

## Project structure

```text
.
├── index.html
├── README.md
├── GAME_SPEC.md
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── sentence-builder.js
│   ├── picture-shooter.js
│   └── type-preposition.js
└── assets/
    ├── images/
    └── sounds/
```

## Add the assets

Place the 14 PNG files in:

```text
assets/images/
```

Required image names:

```text
cat_behind_chair.png
cat_between_table_and_box.png
cat_in_box.png
cat_in_front_of_box.png
cat_near_lamp.png
cat_next_to_sofa.png
cat_on_box.png
cat_reference.png
cat_under_table.png
cover_picture_shooter.png
cover_sentence_builder.png
cover_type_preposition.png
room_background.png
site_logo.png
```

Place the 32 MP3 files in:

```text
assets/sounds/
```

Required sound names:

```text
background.mp3
button.mp3
correct.mp3
wrong.mp3
win.mp3
timer.mp3
shot.mp3
hit.mp3
block_connect.mp3
typing.mp3
meow.mp3
welcome.mp3
choose.mp3
great_job.mp3
try_again.mp3
excellent.mp3
completed.mp3
in.mp3
on.mp3
under.mp3
behind.mp3
next_to.mp3
in_front_of.mp3
between.mp3
near.mp3
the_cat.mp3
is.mp3
the_box.mp3
the_table.mp3
the_chair.mp3
the_sofa.mp3
the_lamp.mp3
```

## Run locally

Because the project uses relative files, use a small local server.

### Python

From the project directory:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

### Visual Studio Code

Use the **Live Server** extension and open `index.html`.

## Publish with GitHub Pages

1. Create a public GitHub repository.
2. Upload all project files without changing the folder structure.
3. Open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select branch `main` and folder `/ (root)`.
6. Save.
7. GitHub will show the published site address.

## Features

- level A1;
- 8 rounds per game;
- Easy, Medium and Hard;
- Slow, Normal and Fast;
- score, lives, timer and result screen;
- separate controls for music and game sounds;
- rules for every game;
- responsive layout for phone, tablet and desktop;
- local best scores;
- keyboard-accessible controls;
- no server required.

## Important

Do not rename the asset files unless the paths are also changed in the JavaScript.

The full technical specification is in [`GAME_SPEC.md`](GAME_SPEC.md).
