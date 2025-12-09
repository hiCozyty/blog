<div class="contact-container">

	<div class="contact-item">
		<h2>
			<a href="https://github.com/hicozyty" target="_blank" rel="noopener noreferrer">
				My GitHub
			</a>
		</h2>
	</div>

	<div class="contact-item">
		<h2>
			<a href="sgnl://signal.me/#u/cozyty.443" target="_blank" rel="noopener noreferrer">
				Signal Contact
			</a>
		</h2>
		<img 
			src="/images/signalContact.jpg" 
			alt="Signal QR Code" 
			style="width:150px; height:auto; display: block;" 
		/>
	</div>

</div>

<style>
    .contact-container {
		/* border:1px black solid; */
        /* Ensures content starts from the left */
        text-align: left;
        /* Reduce space inside the bordered container and remove extra top spacing */
        padding: 0.5rem 0.75rem;
    }

    .contact-item {
        margin-bottom: 100px; /* Adds vertical space between the GitHub and Signal sections */
    }

	h2 a {
        /* Base styles */
        text-decoration: underline;
        color: inherit;
        
        /* Updated transition for smoothness */
        transition: 
            background-color 0.2s ease-in-out, 
            transform 0.1s ease-out, /* Added transform for movement */
            box-shadow 0.1s ease-out; /* Added box-shadow for depth */
            
        display: inline-block; 
        padding: 5px 10px;
        background-color: transparent;
        border-radius: 25px;    
        
        /* Initial State: Add a subtle shadow for perceived depth */
        /* box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);  */
    }

    h2 a:hover {
        /* Hover bubble effect */
        background-color: var(--lightAccent);
        color: inherit;
        /* Increase shadow slightly on hover for visual pop */
        /* box-shadow: 3px 3px 8px rgba(0, 0, 0, 0.3); */
    }
    
    /* 💥 NEW: Active (Click) State for "Pressing" Effect 💥 */
    h2 a:active {
        /* 1. Move element */
        transform: translate(1px, 1px); 
        
        /* 2. Shrink shadow (makes it look pressed down/flush) */
        /* box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2); */
        
        /* Optional: Change background color slightly while pressed */
        background-color: color-mix(in srgb, var(--lightAccent) 80%, black);
    }
    :global(#main) {
        margin-top: 2.5rem; /* was 6rem in layout.css; change to taste */
    }
</style>