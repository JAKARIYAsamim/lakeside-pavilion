# Lakeside Pavilion: coming soon hero

A single hero section in plain HTML, CSS and JavaScript. No build step and no
framework: open `index.html` in a browser, or upload the folder to any host.

## Files

| File | What it holds |
| --- | --- |
| `index.html` | All the words, the menu, the button and the sign-up card. Lines marked `EDIT` are the ones to change. |
| `css/styles.css` | Colours, fonts, sizes and positions. The settings block at the top has the values you will change most. |
| `js/edit.js` | Edit mode (only loaded when the address ends in `?edit`). |
| `tools/serve.py` | The preview server. It also lets edit mode save positions into the stylesheet. |
| `js/main.js` | The sign-up form behaviour. The form is not connected yet (see below). |
| `assets/bg.jpg` | The photo, with the pin, the moving machines and the cars removed (they sit on top as separate pieces). The soft blur on the surroundings and the film grain are part of this file. |
| `assets/site/` | The moving pieces, cut out of the photo: cars (`car*.png`), the palms they pass behind (`trees-*.png`), and the machines: wheel loader, excavator arm, crane cable and hook, and the dump truck in parts (chassis, bed, soil load, soil pile). |
| `assets/pin.webp` | The pin cut out of the same photo, at double size with a smoothed edge. It sits on top of the name so the name looks like it is behind the pin. |
| `assets/source/bg-with-pin.jpg` | The photo from just before the pin was taken out of it. |
| `assets/source/bg-with-machines.jpg` | The photo before the machines were cut out. |
| `assets/source/photo-clean.png` | The photo with colour correction only (no blur, no grain), for making new versions. |
| `assets/fonts/` | Inter and Inter Display (open licence, see `OFL-NOTICE.txt`). |

## Edit mode: move things by dragging

1. Start the preview server: `python3 tools/serve.py`
2. Open `http://127.0.0.1:4800/?edit` (the page address with `?edit` added at
   the end). There is no longer an "Edit layout" button on the page.
3. Drag any text or interface piece: the two words of the name, the logo, menu,
   buttons, corner text, tagline, countdown and sign-up card. Or click a piece and
   use the arrow keys (hold Shift to move 10 at a time). The photo, pin,
   machines and cars cannot be moved.
4. Every move is kept in your browser straight away, so a reload keeps it.
5. Press **Save to site** to write the positions into `css/styles.css` (the
   `MOVED PIECES` part at the end). From then on that is the layout for
   everyone. Upload the changed `css/styles.css` to publish it.

"Reset this" and "Reset all" put pieces back where they were designed; save
again to keep that. Edit mode changes the desktop layout only; the phone layout
is a stacked column. On a published site `?edit` can only move things in that
visitor's own browser: saving to the file works only through `tools/serve.py`
on your own computer.

## Common edits

**Change any text.** Open `index.html` and edit the words on the lines marked
`EDIT`. A `<br>` starts a new line.

**Add the real logo.** In `index.html`, replace the `LP` text inside
`<a class="mark">` with `<img src="assets/logo.svg" alt="Lakeside Pavilion">`.

**Change colours.** Edit the colour values in the settings block at the top of
`css/styles.css`. The green area (the number strip and
the gallery, and the grass fading into it) is the brand's dark Emerald Green,
`--emerald-dark`, `#022D1E`, taken from the emerald fabric picture. If you change
it, also change `2 45 30` wherever it appears in that file: that is the same
colour, used where it fades to clear. Dark text and the other sections use
`--ink`, a near-black green. The light sections (About and the ownership offer) have
the brand Warm Ivory behind them, `--ivory`, `#F3E9DA`.

**Make the dark edges stronger or lighter.** Change `--vignette` in the same
block: `0` turns it off, `1` is very dark.

**Move or resize something on desktop.** In the `DESKTOP LAYOUT` part of
`css/styles.css`, every number is a pixel position on a 1672 x 941 design.
For example `.tag { left: calc(40 * var(--u)); top: calc(566 * var(--u)); }`
puts the tagline 40px from the left and 566px from the top.

**Change the giant name.** Edit the two words in `<h1 class="giant">`. If the
new words are longer or shorter, adjust `font-size` and the `left` values of
`.giant .w1` and `.giant .w2` so each word still tucks slightly behind the pin.

**Change the opening animation.** It plays once each time the page loads: the
screen opens from dark into a widescreen strip while the camera pulls back, the
name rises letter by letter, then the dark bars slide away and the other text
follows. To make it slower or
faster, change `--intro-speed` in the settings block of `css/styles.css`
(`2` = twice as slow, `.5` = twice as fast). To change when one piece starts,
edit its `--at` number (seconds) in the `OPENING ANIMATION` part of the same
file. `--bars` sets how thick the dark bars are and `--zoom-from` how far the
camera starts pushed in. To turn it off, delete the small `<script>` in the `<head>` of
`index.html`. Visitors who have "reduce motion" switched on never see it.

**Change the pin drop.** During the opening animation the pin falls in from
above, lands with a small squash and a puff of dust, its shadow slides in, and
two rings spread over the ground from its tip. It plays once. `--pin-at` in the
`PIN DROP` part of `css/styles.css` is when the pin starts to fall (seconds).
The pin is no longer part of `assets/bg.jpg`: it is `assets/pin.webp`, with its
shadow in `assets/site/pin-shadow.png`.

**Change the working machines.** The loader drives back and forth, the
excavator's lower arm digs, the crane hook sways and lifts, and the dump truck
tips its bed up and pours its soil into a pile behind it, with small dust puffs. Their motion is in the
`MACHINES` part of `css/styles.css`: change the seconds to speed one up or slow
it down, or the pixel distances to move it further. The dump truck's full cycle length is `--tip-time` (18 seconds). To freeze them all, set
`--machines` to `paused`. Visitors who have "reduce motion" switched on see them
standing still.

**Change the traffic.** Cars drive both ways along the lake-front road and up
and down the road on the right, passing behind the palms. Each car is one line
in the `TRAFFIC` part of `index.html`: `--t` is how long its loop takes (bigger
is slower) and `--d` shifts when it starts. Delete a line to remove that car.
`--machines: paused` freezes the cars too.

**Replace the photo.** `bg.jpg` and `pin.webp` must come from the same image and
be the same size, or the pin will not line up. A new photo needs a new pin
cut-out (the pin on a transparent background, saved at the photo's full size). It also
needs new machine cut-outs, or remove the machine pieces from `index.html`.

**Tall windows.** The photo keeps its 16:9 shape. When the browser window is
taller than that, the space under the photo is filled with the lake continuing
down into the dark page colour (`HERO FILL` in `css/styles.css`), so the next
section never shows under the hero.

**The countdown.** Along the bottom of the hero: the days, hours, minutes and
seconds left until launch. **Its date is a placeholder (1 January 2027, 10:00
Dhaka time): put the real launch date in.** Find `COUNTDOWN` in `index.html`
and change `data-launch` (year-month-day, then `T`, the time, and `+06:00` for
Dhaka). When that moment has passed it shows the words in `data-done` ("Now
open"). It is a movable piece in edit mode, like the other hero text.

## The About section

It sits under the hero in `index.html` (`<section class="about">`), on a light
background: one big statement, a round seal with turning text,
a short paragraph, and a round
arrow button at the bottom left that goes back to the top. Edit the words on the lines marked `EDIT`. In the statement, a `<br>`
starts a new line and words wrapped in `<em>` are set in italic serif. Its
styles are in the `ABOUT SECTION` part of `css/styles.css`. The "Overview" menu
link scrolls to it. The italic serif is Instrument Serif (open licence, SIL OFL).

## The trust strip (badges and logos)

At the bottom of the About section a row of names moves slowly from right to
left: RAJUK approved plan, REHAB member, BNBC compliant, Fire Service & Civil
Defence clearance, Department of Environment clearance, Bank home-loan
partners. **Check every one before launch**: keep only what this project
really holds, and delete the line for anything it does not.

To edit, find `TRUST STRIP` in `index.html`. Change the words inside `<span>`,
or show a logo instead of a name by swapping the line for
`<li class="trust-item"><img src="assets/trust/your-logo.svg" alt="Name of the organisation"></li>`
(put the file in `assets/trust/`). Add or delete lines as needed; the row
repeats itself to fill the screen. `--trust-time` in `css/styles.css` sets the
speed and `--trust-logo` the logo height.

## The ownership offer

Under the About section: the headline "With only ৳10,000
you can be a property owner", a "Register interest" button, and under
them the picture of two hands passing a rolled document over a green field
(`assets/handover.webp`). The headline sits behind the picture, so the scroll
and the sleeve pass in front of some letters; the button sits on the
grass. If you change the headline, check no important word is hidden. To edit the words, find `OWNERSHIP OFFER` in
`index.html`. **Before launch, say what the ৳10,000 is** (booking money, first
instalment, per month?) and add any conditions. The sky has been cut out of the picture so the page colour shows
behind the hands; the picture as supplied is in
`assets/source/handover-original.png`.

**Its opening animation.** Like the hero, it plays once, when the section first
scrolls into view: the picture pulls back and brightens, the headline rises
letter by letter, the hands reach in, then the button appears. `--deed-speed`
in the `OWNERSHIP OFFER` part of `css/styles.css` makes it all slower (`2`) or
faster (`.5`).

**The price counts down.** As the headline rises, the price runs down from
৳99,999 and lands on ৳10,000. In `index.html`, on the price in the headline,
`data-from` is where it starts and `data-count` where it lands (keep the text
the same as `data-count`). Delete `data-from` to stop the countdown.

**The hands move a little.** The picture is in three pieces
(`assets/handover-field.webp`, `-left.webp`, `-right.webp`; the field has the
hands painted out). When the section scrolls into view each hand reaches in a
short way, once, then they sway very slightly. In the `OWNERSHIP OFFER` part of
`css/styles.css`: `--hand-reach` is how far they start drawn back, `--hand-time`
how slow the sway is, and `--hands: paused` stops the sway. Visitors with
"reduce motion" switched on see the hands still. `assets/handover.webp` is the
whole picture in one piece, and `assets/source/handover-cutout.py` made all four.

## The number strip

After the ownership offer and before the gallery, on the dark emerald: four
big numbers in one row (two by two on phones). They count up once. **The four
numbers are samples, not real figures**: find `NUMBER STRIP` in `index.html`
and put in the project's true numbers and captions before launch. Styles are
in the `NUMBER STRIP` part of `css/styles.css`.

## The grain over everything

From the second section (About) to the end of the footer, a fine film grain
lies over the top of every layer: text, pictures, the gallery, the door. It is
`assets/grain-top.png`, tiny light and dark specks on a clear background. In
the `GRAIN OVER EVERYTHING` part of `css/styles.css`, `--top-grain` is how
strong it is (`0` switches it off) and `--top-grain-size` how fine. The hero
is not covered: its photo has its own grain. The earlier grain that sat only
in the green background is switched off (`--grain-on: none`), so the green is
not grained twice.

## The gold pattern on the green

Every dark emerald area carries a faint pattern of thin
gold lines: a grid of squares with arcs, leaves and arches in them
(`assets/pattern-gold.svg`). In the same part of `css/styles.css`,
`--pattern-size` is the size of one repeat, and changing `--pattern-on` to
`none` switches it off. To change the shapes, how strong the lines are
(`OPACITY`) or the gold, edit and re-run `assets/source/pattern-gold.py`.

**The pattern draws itself.** When a green area first scrolls into view, the
gold lines are traced one after another: first the grid, then the shapes,
sweeping down and across. It plays once for the number strip and gallery, and
once for the closing section. In the `GOLD PATTERN DRAWS` part of
`css/styles.css`, `--draw-time` is how long one line takes and `--draw-step`
the pause between one line starting and the next. Visitors with "reduce
motion" switched on see the pattern already drawn. (The page reads
`assets/pattern-gold.svg` to do this; opened straight from a folder, without
the preview server or a web host, it shows the still pattern instead.)

## The gallery

After the number strip, on the same dark background: eight upright pictures in
one row on a curved wall that turns slowly by itself. The middle picture is the
smallest and the ones at the sides lean in and grow. Visitors can drag the wall
to turn it by hand. The "Gallery" menu link scrolls to it.

Over the middle of the gallery sit the words "Revealed at launch." in gold. To
edit them, find `gallery-note` under `GALLERY` in `index.html`.

**Pixel blur.** Until launch the gallery is blurred and pixelated together: a
soft blur first, then a fine grid of small square "pixels" over it. In the
`GALLERY` part of `css/styles.css` (one set of numbers for phones, one for
wider screens), `--pixel-blur` is how soft the blur is and `--pixels` how many
squares cross the screen: more means smaller squares, and `0` switches the grid
off and shows the pictures sharp. The effect is only on screen: the picture
files themselves are still sharp and can be opened directly, so save any
picture that must stay secret already blurred.

The eight pictures in `assets/gallery/` (`01.jpg` to `08.jpg`) are **stand-ins
cut out of the hero photo**, so they are small and a little soft: replace them
with real project pictures before launch (upright, 3 wide by 4 tall, same file
names), and change the `alt` words under `GALLERY` in `index.html`. Keep at
least 8 so the wall has no gap. `--arc-speed` is how fast it turns (`0` stops
it, a minus number reverses it).

## The reels (video section)

After the gallery, on the green: the headline "See it in motion." and four
upright video cards, like phone reels (four across on wide screens; on phones
a row you swipe sideways). Pressing a card plays its video with sound and
stops any other; pressing again pauses it. Each card has a thin gold line
round it that traces itself when the section first comes into view, one card
after another (`--line-time` and `--line-step` in the `REELS` part of
`css/styles.css`).

**The videos are not there yet.** Put them in `assets/reels/` named `01.mp4`
to `04.mp4` (upright, 9 wide by 16 tall, MP4 / H.264; see `READ-ME.txt` in
that folder). Until a card's file exists it shows "Video coming soon". The
picture on each card (`01.jpg` ...) is a stand-in cut from the hero photo:
replace it with a frame from the video. To rename the cards or change how
many there are, find `REELS` in `index.html`. Styles are in the `REELS` part
of `css/styles.css`.

## The closing section

Last on the page: the big two-line headline "A new door / is opening soon."
over the picture of doors in a misty field, with a "Be the first to know"
button on the grass below. The headline sits behind the open door: the page
draws the picture (`assets/doors.jpg`), then the headline, then the open door
again on top (`assets/doors-front.webp`, cut out of the same picture), so the
door covers part of a few letters. The top of the picture melts into the dark
emerald above it, and the picture eases back a little when the section first
comes into view. To edit the words, find `CLOSING SECTION` in `index.html`
(the `<br>` starts the second line); its styles are in the `CLOSING SECTION`
part of `css/styles.css`. If you change the headline, check that no important
letters end up hidden behind the door. The button takes the visitor to the
email box at the top.

**One look.** The section used to have a second version, doors in a misty
field, with a button to switch between the two. That version and the button
were removed; its pictures and the button's script are kept in
`assets/source/door-field/`. In the gold picture the black background is not
shown: the door and its floor stand against the same emerald as the rest.

**The gold door opens.** When the section scrolls into view
the two leaves of the door swing inward and light pours out onto the floor. It
plays once. In the `DOOR OPENS` part of `css/styles.css`, `--door-open` is how
far the leaves swing (degrees), `--door-time` how long it takes and
`--door-wait` the pause before it starts. The leaves are drawn from
`assets/doors-gold-leaf.jpg` and its mirror image `doors-gold-leaf-r.jpg`. Visitors with "reduce motion" switched on see the
door already open.

## The footer

Last on the page, on the near-black the door's floor ends in:

- **Top row:** the name with one line and the contact details; three columns
  of links (Project, Company, Launch); and "Stay informed" with an email box.
- **The countdown, large:** days, hours, minutes and seconds to launch. It
  follows the date set on the hero countdown, so there is one date to change.
- **Small print:** the copyright line and "Back to top".

To edit the words and links, find `FOOTER` in `index.html`; styles are in the
`FOOTER` part of `css/styles.css`. **The email address and phone number are
placeholders: put the real ones in.** The footer's email box, like the hero's,
is not connected yet. There are no social media, privacy or terms links,
because those pages and accounts were not available: add them when they are.

The gold line drawing of the lake front that used to sit here was replaced
by the countdown. It is kept in `assets/source/footer-scene.html`, with the
script that draws it (`assets/source/footer-scene.py`).

## Things to finish before launch

1. **Sign-up form.** It only shows a preview message. Connect it to your
   mailing list or server in `js/main.js` (the block to replace is marked).
2. **Menu links.** "Overview" scrolls to the About section and "Gallery" to
   the gallery; the other three still point to `#top`. (The reels section has the id `films` if you want a link to it.) Point them at real pages or sections.
3. **About section.** Its wording is placeholder. Replace it with real copy.
   The trust strip under it names six approvals and memberships: confirm each
   one is true for this project, and delete any that is not.
4. **Footer details.** The footer's email address and phone number are
   placeholders, and its email box is not connected.
5. **Countdown date.** The hero countdown runs to a placeholder date. Set the
   real launch date and time in `data-launch` in `index.html`.
6. **Placeholder wording.** The tagline and the card text are
   placeholders. The four numbers in the number strip are samples: replace them
   with real figures.
7. **Photo size.** The photo is 1672px wide, so it looks soft on large screens.
   Use a higher-resolution version when you have one.

## Browser support

Current versions of Chrome, Edge, Safari and Firefox. The desktop layout uses
CSS container query units (`cqw`).

## Gold buttons

The three main buttons ("Notify me" in the hero, "Register interest" in the ৳10,000 section, "Be the first to know" under the doors) are brushed gold with a light that sweeps across and a soft ring that breathes out. The block is "CALL-TO-ACTION BUTTONS" at the end of `css/styles.css`: `--cta-every` sets how often the light passes, `--cta-on: paused` stops the movement.

### Real logos in the trust strip (14 Nov 2026)

Five items now show a real logo from `assets/trust/` next to the words:
`gov-seal.png` (used for RAJUK: it is the Bangladesh government seal, not RAJUK's own logo), `rehab.png`, `bnbc.png`,
`fire-service.png`, `doe.png` (white background removed). "Bank home-loan partners" was removed, and the items no longer have a rounded outline.

## Hidden sections (14 Nov 2026)

Three sections are switched off but still in the files: the number strip, the gallery and the "A new door is
opening soon" section, plus the menu and footer links that pointed to them. Each has the word `hidden` in its
opening tag in `index.html` (search for `HIDDEN FOR NOW` and for `<a hidden`). Delete that word to show it again.
While the door section is hidden, the green area fades into the footer by itself.

## Price highlight

A gold marker stroke is drawn behind the ৳10,000 as the number finishes counting. Block "PRICE HIGHLIGHT" at the
end of `css/styles.css`: `--mark-delay` is when it starts, `--mark-on: 0` hides it.

## Hero headline (15 Nov 2026)

The giant text in the hero is now "The biggest investment opportunity in Purbachal": two lines to the left of the
pin and two to the right (the `<h1 class="giant">` lines in `index.html`). "Lakeside Pavilion" is the smaller line
in the bottom-left corner (`<p class="tag">`). Sizes and positions are in the "HERO HEADLINE" block at the end of
`css/styles.css` (`--head` is the letter size on desktop).

### Key words large, other words smaller

In the headline the key words (marked `hi` in `index.html`: BIGGEST, INVESTMENT, PURBACHAL) share the full size;
the other words (THE, OPPORTUNITY, IN) are half that. `--small` in the "KEY WORDS LARGE, THE OTHER WORDS SMALLER"
block at the end of `css/styles.css` sets how much smaller.
