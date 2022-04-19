// Focus div based on nav button click

// Flip one coin and show coin image to match result when button clicked

// Flip multiple coins and show coin images in table as well as summary results
// Enter number and press button to activate coin flip series

// Guess a flip by clicking either heads or tails button
<html>
	<head>
		<title>Demo Coin</title>
		<style>
			img#quarter {
				width: 100px;
			}
		</style>
	</head>
	<body>

<!-- A "coin" button -->
		<button id="coin">Flip?</button>
<!-- A status paragraph -->
		<p id="active"></p>
<!-- A result paragraph-->
		<p>Result: <span id="result"></span></p>
<!-- An image of a US quarter (North Carolina variant) -->
		<img src="coin.jpg" id="quarter">

		<script>
// Event listener for whatever is being clicked
//			document.addEventListener("click", activeNow);
// Replace text in anything with "active" id
			// function activeNow() {
			// 	const active_now = document.activeElement
			// 	document.getElementById("active").innerHTML = active_now;
			// 	console.log(active_now)
			// }
// Button coin flip element
			const coin = document.getElementById("coin")
// Add event listener for coin button
			coin.addEventListener("click", flipCoin)
			function flipCoin() {
                fetch('http://localhost:5000/app/flip/', {mode: 'cors'})
  				.then(function(response) {
    			  return response.json();
  				})
				.then(function(result) {
					console.log(result);
					document.getElementById("result").innerHTML = result.flip;
					document.getElementById("quarter").setAttribute("src", result.flip+".jpg");
					coin.disabled = true
				})
//				let flip = "FLIPPED"
//				document.getElementById("coin").innerHTML = flip;
//				console.log("Coin has been flipped. Result: "+ flip)
			}
		</script>
	</body>
</html>