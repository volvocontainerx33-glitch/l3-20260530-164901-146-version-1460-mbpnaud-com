(function () {
    function initMoviePlayer(videoId, sourceUrl) {
        var video = document.getElementById(videoId);
        if (!video || !sourceUrl) {
            return;
        }

        var shell = video.closest(".player-shell");
        var button = shell ? shell.querySelector(".player-start") : null;
        var hlsInstance = null;
        var prepared = false;

        function attachSource() {
            if (prepared) {
                return Promise.resolve();
            }

            prepared = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = sourceUrl;
                return Promise.resolve();
            }

            if (window.Hls && window.Hls.isSupported()) {
                return new Promise(function (resolve) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(sourceUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        resolve();
                    });
                    hlsInstance.on(window.Hls.Events.ERROR, function () {
                        resolve();
                    });
                    window.setTimeout(resolve, 1200);
                });
            }

            video.src = sourceUrl;
            return Promise.resolve();
        }

        function hideButton() {
            if (button) {
                button.classList.add("is-hidden");
            }
        }

        function play() {
            hideButton();
            attachSource().then(function () {
                var promise = video.play();
                if (promise && promise.catch) {
                    promise.catch(function () {
                        if (button) {
                            button.classList.remove("is-hidden");
                        }
                    });
                }
            });
        }

        if (button) {
            button.addEventListener("click", function () {
                play();
            });
        }

        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", hideButton);

        video.addEventListener("ended", function () {
            if (button) {
                button.classList.remove("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    window.initMoviePlayer = initMoviePlayer;
})();
