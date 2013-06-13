
# rating

  Rating component with SVG stars [demo](http://monstercat.github.com/rating)

  <img src="https://raw.github.com/monstercat/rating/master/preview.png" width="95px" height="34px"/>

## Installation

    $ component install monstercat/rating

## Example

```javascript
var rating = require('rating');
var rate = rating({ stars: 10 });
var container = document.querySelector('.example');

rate.attach(container);
rate.disable();
rate.enable();
rate.rate(5);
rate.set([1,3,4,6]);
rate.on('rating', function(rating){
  console.log(rating);
});
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

