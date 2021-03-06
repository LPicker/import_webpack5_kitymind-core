define(function(require, exports, module) {
    var kity = require('../core/kity');
    var utils = require('../core/utils');

    var Minder = require('../core/minder');
    var MinderNode = require('../core/node');
    var Command = require('../core/command');
    var Module = require('../core/module');
    var Renderer = require('../core/render');

    Module.register('Zoom', function() {
        var me = this;

        var timeline;

        function setTextRendering() {
            var value = me._zoomValue >= 100 ? 'optimize-speed' : 'geometricPrecision';
            me.getRenderContainer().setAttr('text-rendering', value);
        }

        function fixPaperCTM(paper) {
            var node = paper.shapeNode;
            var ctm = node.getCTM();
            var matrix = new kity.Matrix(ctm.a, ctm.b, ctm.c, ctm.d, (ctm.e | 0) + 0.5, (ctm.f | 0) + 0.5);
            node.setAttribute('transform', 'matrix(' + matrix.toString() + ')');
        }

        kity.extendClass(Minder, {
            zoom: function(value) {
                var paper = this.getPaper();
                var viewport = paper.getViewPort();
                viewport.zoom = value / 100;
                viewport.center = {
                    x: viewport.center.x,
                    y: viewport.center.y
                };
                paper.setViewPort(viewport);
                if (value == 100) fixPaperCTM(paper);
            },
            getZoomValue: function() {
                return this._zoomValue;
            }
        });

        function zoomMinder(minder, value) {
            var paper = minder.getPaper();
            var viewport = paper.getViewPort();

            if (!value) return;

            setTextRendering();

            var duration = minder.getOption('zoomAnimationDuration');
            if (minder.getRoot().getComplex() > 200 || !duration) {
                minder._zoomValue = value;
                minder.zoom(value);
                minder.fire('viewchange');
            } else {
                var animator = new kity.Animator({
                    beginValue: minder._zoomValue,
                    finishValue: value,
                    setter: function(target, value) {
                        target.zoom(value);
                    }
                });
                minder._zoomValue = value;
                if (timeline) {
                    timeline.pause();
                }
                timeline = animator.start(minder, duration, 'easeInOutSine');
                timeline.on('finish', function() {
                    minder.fire('viewchange');
                });
            }
            minder.fire('zoom', {
                zoom: value
            });
        }

        /**
         * @command Zoom
         * @description ??????????????????????????????????????????????????????
         * @param {number} value ???????????????????????? 100 ???????????????
         * @state
         *   0: ????????????
         */
        var ZoomCommand = kity.createClass('Zoom', {
            base: Command,
            execute: zoomMinder,
            queryValue: function(minder) {
                return minder._zoomValue;
            }
        });

        /**
         * @command ZoomIn
         * @description ????????????????????????????????????????????????????????????
         * @shortcut =
         * @state
         *   0: ?????????????????????????????????????????????????????????
         *  -1: ????????????
         */
        var ZoomInCommand = kity.createClass('ZoomInCommand', {
            base: Command,
            execute: function(minder) {
                zoomMinder(minder, this.nextValue(minder));
            },
            queryState: function(minder) {
                return +!this.nextValue(minder);
            },
            nextValue: function(minder) {
                var stack = minder.getOption('zoom'),
                    i;
                for (i = 0; i < stack.length; i++) {
                    if (stack[i] > minder._zoomValue) return stack[i];
                }
                return 0;
            },
            enableReadOnly: true
        });

        /**
         * @command ZoomOut
         * @description ????????????????????????????????????????????????????????????
         * @shortcut -
         * @state
         *   0: ?????????????????????????????????????????????????????????
         *  -1: ????????????
         */
        var ZoomOutCommand = kity.createClass('ZoomOutCommand', {
            base: Command,
            execute: function(minder) {
                zoomMinder(minder, this.nextValue(minder));
            },
            queryState: function(minder) {
                return +!this.nextValue(minder);
            },
            nextValue: function(minder) {
                var stack = minder.getOption('zoom'),
                    i;
                for (i = stack.length - 1; i >= 0; i--) {
                    if (stack[i] < minder._zoomValue) return stack[i];
                }
                return 0;
            },
            enableReadOnly: true
        });

        return {
            init: function() {
                this._zoomValue = 100;
                this.setDefaultOptions({
                    zoom: [10, 20, 50, 100, 200]
                });
                setTextRendering();
            },
            commands: {
                'zoomin': ZoomInCommand,
                'zoomout': ZoomOutCommand,
                'zoom': ZoomCommand
            },
            events: {
                'normal.mousewheel readonly.mousewheel': function(e) {
                    if (!e.originEvent.ctrlKey && !e.originEvent.metaKey) return;

                    var delta = e.originEvent.wheelDelta;
                    var me = this;
                    // ??????
                    if (Math.abs(delta) > 100) {
                        clearTimeout(this._wheelZoomTimeout);
                    } else {
                        return;
                    }

                    this._wheelZoomTimeout = setTimeout(function() {
                        var value;
                        var lastValue = me.getPaper()._zoom || 1;
                        if (delta > 0) {
                            me.execCommand('zoomin');
                        } else if (delta < 0) {
                            me.execCommand('zoomout');
                        }
                    }, 100);
                    
                    e.originEvent.preventDefault();
                }
            },

            commandShortcutKeys: {
                'zoomin': 'ctrl+=',
                'zoomout': 'ctrl+-'
            }
        };
    });
});