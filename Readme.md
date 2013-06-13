
# rating

  Rating component [demo](http://monstercat.github.com/rating)

  ![Rating preview](preview.png)

## Installation

    $ component install monstercat/rating

## Example

```javascript
var rating = require('rating');
var rate = rating({ stars: 10 });
var container = document.querySelector('.example');

rate.attach(container);
```

## Adjust star size

```css
.star {
  // defaults
  height: 16px;
  width: 16px;
}
```

## License

  MIT

