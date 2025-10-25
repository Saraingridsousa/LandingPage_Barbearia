$(document).ready(function() {
    $('#btn_mobile').on('click', function() {
        $('#mobile_menu').toggleClass('active');
    });
    // Close mobile menu when a link inside it is clicked (so it collapses after navigation)
    $('#mobile_menu').on('click', 'a', function(){
        // small delay to allow anchor navigation to start
        setTimeout(function(){ $('#mobile_menu').removeClass('active'); }, 50);
    });


    (function(){
        const $carousel = $('.carousel');
        if(!$carousel.length) return;

        $carousel.each(function(){
            const $c = $(this);
            const $track = $c.find('.carousel-track');
            const $originalSlides = $track.find('.carousel-slide');
            const $prev = $c.find('.carousel-arrow.prev');
            const $next = $c.find('.carousel-arrow.next');
            const $dotsWrap = $c.parent().find('.carousel-dots');
            const interval = parseInt($c.data('interval')) || 5000;
            let timer = null;

            if($originalSlides.length <= 1){
                $originalSlides.each(function(i){
                    const $dot = $('<button>').addClass('carousel-dot').attr('data-index', i);
                    if(i===0) $dot.addClass('active');
                    $dotsWrap.append($dot);
                });
                const $dots = $dotsWrap.find('.carousel-dot');
                let current = 0;
                function goToSimple(i){ if(i < 0) i = 0; if(i >= $originalSlides.length) i = 0; current = i; const slideWidth = $originalSlides.outerWidth(true); $track.css('transform', 'translateX(' + ( - (slideWidth * i) ) + 'px)'); $dots.removeClass('active').eq(i).addClass('active'); }
                function nextSimple(){ goToSimple(current+1); }
                $next.on('click', function(){ nextSimple(); restartTimer(); });
                $prev.on('click', function(){ goToSimple(current-1); restartTimer(); });
                $dots.on('click', function(){ const i = parseInt($(this).attr('data-index')); goToSimple(i); restartTimer(); });
                function startTimer(){ if(timer) clearInterval(timer); timer = setInterval(nextSimple, interval); }
                function stopTimer(){ if(timer) clearInterval(timer); timer = null; }
                function restartTimer(){ stopTimer(); startTimer(); }
                $c.on('mouseenter', stopTimer).on('mouseleave', startTimer);
                let startX = 0;
                $track.on('touchstart', function(e){ startX = e.originalEvent.touches[0].clientX; });
                $track.on('touchend', function(e){ const endX = e.originalEvent.changedTouches[0].clientX; if(startX - endX > 40){ nextSimple(); restartTimer(); } else if(endX - startX > 40){ goToSimple(current-1); restartTimer(); } });
                $(window).on('resize', function(){ goToSimple(current); });
                goToSimple(0);
                startTimer();
                return;
            }

            const slideCount = $originalSlides.length;
            const $firstClone = $originalSlides.first().clone().addClass('clone');
            const $lastClone = $originalSlides.last().clone().addClass('clone');
            $track.append($firstClone);
            $track.prepend($lastClone);

            const $slides = $track.find('.carousel-slide');

            for(let i=0;i<slideCount;i++){
                const $dot = $('<button>').addClass('carousel-dot').attr('data-index', i);
                if(i===0) $dot.addClass('active');
                $dotsWrap.append($dot);
            }
            const $dots = $dotsWrap.find('.carousel-dot');

            // Current refers to position in cloned slides (starts at 1 => first real slide)
            let current = 1;

            // Helpers
            function isVertical(){ return window.matchMedia('(max-width: 520px)').matches; }
            // compute slide size from the first real slide to avoid inconsistencies after cloning
            function slideSize(){
                // after cloning, real first slide is at index 1
                const $firstReal = $track.find('.carousel-slide').eq(1);
                if(!$firstReal.length) return 0;
                return isVertical() ? $firstReal.outerHeight(true) : $firstReal.outerWidth(true);
            }
            function setTransition(enabled){ $track.css('transition', enabled ? '' : 'none'); }
            function updateDots(){ const realIndex = (current - 1 + slideCount) % slideCount; $dots.removeClass('active').eq(realIndex).addClass('active'); }
            function setPosition(){ const size = slideSize(); if(!size && size !== 0){ /* guard */ }
                if(isVertical()){ $track.css('transform','translateY(' + ( - (size * current) ) + 'px)'); } else { $track.css('transform','translateX(' + ( - (size * current) ) + 'px)'); } updateDots(); }

            function goToReal(realIndex){ current = realIndex + 1; setTransition(true); setPosition(); }

            function nextSlide(){
                setTransition(true);
                current++;
                setPosition();
            }

            function prevSlide(){
                setTransition(true);
                current--;
                setPosition();
            }

            $track.on('transitionend', function(){
                const lastCloneIndex = slideCount + 1;
                if(current === 0){
                    setTransition(false);
                    current = slideCount;
                    setPosition();
                    void $track[0].offsetHeight;
                    setTransition(true);
                } else if(current === lastCloneIndex){
                    setTransition(false);
                    current = 1;
                    setPosition();
                    void $track[0].offsetHeight;
                    setTransition(true);
                }
            });

            $next.on('click', function(){ nextSlide(); restartTimer(); });
            $prev.on('click', function(){ prevSlide(); restartTimer(); });

            $dots.on('click', function(){ const i = parseInt($(this).attr('data-index')); goToReal(i); restartTimer(); });

            function startTimer(){ if(timer) clearInterval(timer); timer = setInterval(nextSlide, interval); }
            function stopTimer(){ if(timer) clearInterval(timer); timer = null; }
            function restartTimer(){ stopTimer(); startTimer(); }

            $c.on('mouseenter', stopTimer).on('mouseleave', startTimer);

            let startPos = 0;
            $track.on('touchstart', function(e){ startPos = isVertical() ? e.originalEvent.touches[0].clientY : e.originalEvent.touches[0].clientX; });
            $track.on('touchend', function(e){ const endPos = isVertical() ? e.originalEvent.changedTouches[0].clientY : e.originalEvent.changedTouches[0].clientX; if(startPos - endPos > 40){ nextSlide(); restartTimer(); } else if(endPos - startPos > 40){ prevSlide(); restartTimer(); } });

            function applyOrientationClass(){ if(isVertical()){ $c.addClass('vertical'); $prev.html('&#9650;'); $next.html('&#9660;'); } else { $c.removeClass('vertical'); $prev.html('&#10094;'); $next.html('&#10095;'); } }
            applyOrientationClass();
            $(window).on('resize', function(){ applyOrientationClass(); setPosition(); });

            setTransition(false);
            setPosition();
            setTimeout(function(){ setTransition(true); }, 20);
            startTimer();
        });
    })();

});
