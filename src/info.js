$(function() 
{
	 $("#infoBox")
	.css( 
	{
	    "background": "rgba(87,87,87,0.8)",
        
	})
	.dialog({ autoOpen: false, 
		show: { effect: 'fade', duration: 500 },
		hide: { effect: 'fade', duration: 500 },
        width: 600
	});
	
	 $("#infoButton")
       .text("") // sets text to empty
	.css(
	{ "z-index":"2",
	  "background":"rgba(0,0,0,0)", "opacity":"0.9", 
	  "position":"absolute", "top":"4px", "left":"4px"
	}) // adds CSS
    .append("<img width='40' height='40' src='images/icon-info.png'/>")
    .button()
	.click( 
		function() 
		{ 
			$("#infoBox").dialog("open");
		});
});