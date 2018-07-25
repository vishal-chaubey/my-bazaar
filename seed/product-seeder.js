var mongoose = require('mongoose');
var Product = require('../models/product');

mongoose.connect('mongodb://localhost:27017/shopping');
var products = [
		new Product({
			imagePath: '/images/indexslide1.jpeg',
			title: 'White flower',
			description: 'Good choice, I like it.',
			price: 10
		}),
		new Product({
			imagePath: '/images/indexslide2.jpeg',
			title: 'Lovely flowers',
			description: 'You can decorate your place using this.',
			price: 35
		}),	
		new Product({
			imagePath: '/images/indexslide3.jpeg',
			title: 'Multicolor roses',
			description: 'A rose is a woody perennial flowering plant of the genus Rosa',
			price: 71
		}),
		new Product({
			imagePath: '/images/image1.jpeg',
			title: 'Merigold flower',
			description: 'Yellow flower with awesome fragnence.',
			price: 5
		}),
		new Product({
			imagePath: '/images/image2.jpeg',
			title: 'colorful flower',
			description: 'colorful flower with awesome fragnence.',
			price: 95
		}),
		new Product({
			imagePath: '/images/image3.jpeg',
			title: 'multicolor flower',
			description: 'So Colorful, you can like it. ',
			price: 12 
		}),
		new Product({
			imagePath: '/images/indexslide1.jpeg',
			title: 'White flower',
			description: 'Good choice, I like it.',
			price: 10
		}),
		new Product({
			imagePath: '/images/indexslide2.jpeg',
			title: 'Lovely flowers',
			description: 'You can decorate your place using this.',
			price: 35
		}),	
		new Product({
			imagePath: '/images/indexslide3.jpeg',
			title: 'Multicolor roses',
			description: 'A rose is a woody perennial flowering plant of the genus Rosa',
			price: 71
		}),
		new Product({
			imagePath: '/images/image1.jpeg',
			title: 'Merigold flower',
			description: 'Yellow flower with awesome fragnence.',
			price: 5
		}),
		new Product({
			imagePath: '/images/image2.jpeg',
			title: 'colorful flower',
			description: 'colorful flower with awesome fragnence.',
			price: 95
		}),
		new Product({
			imagePath: '/images/image3.jpeg',
			title: 'multicolor flower',
			description: 'So Colorful, you can like it. ',
			price: 12 
		})
];

	

var done = 0;
for(var i = 0; i < products.length; i++){
products[i].save(function(err, result){
done++;
if(done === products.length){
exit();
}
});
}
function exit(){
	mongoose.disconnect();

}
