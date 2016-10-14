/**
 * Created by matthewmueller on 9/23/16.
 */
'use strict';


angular


    .module('myApp')


    // Angular File Upload module does not include this directive
    // Only for example


    .directive('ngDoodle', ['$window', function($window) {
        return {
            restrict: 'A',
            replace: false,

            //template: '<canvas/>',
            link: function(scope, element, attributes) {
                var params = scope.$eval(attributes.ngDoodle);
                console.info('ngDoodle params',params);

                //var MOLdata = params.item.outputLog.split("M  END")[0];

                //console.info(MOLdata);

                //var canvas = element.find('canvas');
                var name = 'sketcher_'+params.index;
                //console.info(name);
                //element.append('<canvas id="' + name + '"></canvas>');
                new ChemDoodle.SketcherCanvas(name, 500, 300,{useServices:true});

                /*ChemDoodle.ELEMENT['H'].jmolColor = 'black';
                ChemDoodle.ELEMENT['S'].jmolColor = '#B9A130';
                var sketcher = new ChemDoodle.SketcherCanvas(name, 500, 300,{useServices:true});
                sketcher.specs.atoms_displayTerminalCarbonLabels_2D = true;
                sketcher.specs.atoms_useJMOLColors = true;
                sketcher.specs.bonds_clearOverlaps_2D = true;
                sketcher.specs.shapes_color = '#c10000';
                //sketcher.loadMolecule(ChemDoodle.readMOL(MOLdata));
                //sketcher.repaint();*/
            }
        }
    }])
    /**
     * The ng-thumb directive
     * @author: nerv
     * @version: 0.1.2, 2014-01-09
     */
    .directive('ngThumb', ['$window', function($window) {
        var helper = {
            support: !!($window.FileReader && $window.CanvasRenderingContext2D),
            isFile: function(item) {
                return angular.isObject(item) && item instanceof $window.File;
            },
            isImage: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|jpg|png|jpeg|bmp|gif|tiff|tif|'.indexOf(type) !== -1;
            },
            isTiff: function(file) {
                var type =  '|' + file.type.slice(file.type.lastIndexOf('/') + 1) + '|';
                return '|tiff|tif|'.indexOf(type) !== -1;
            }
        };

        return {
            restrict: 'A',
            template: '<canvas/>',
            link: function(scope, element, attributes) {
                if (!helper.support) return;

                var params = scope.$eval(attributes.ngThumb);

                //console.log(params);

                if (!helper.isFile(params.file)) return;
                if (!helper.isImage(params.file)) return;
                if (helper.isTiff(params.file)) {
                    //console.log('This bad boy is a TIFF');
                    //var canvas = element.find('canvas');

                    var reader = new FileReader();

                    reader.onload = function() {
                        var buffer = this.result;
                        var tiff = new Tiff({buffer: buffer});
                        var canvas = tiff.toCanvas();
                        var oldCanvas = element.find('canvas');
                        var parent = oldCanvas[0].parentNode;
                        //console.log(parent);
                        parent.removeChild(oldCanvas[0]);
                        parent.appendChild(canvas);
                        //console.log(parent);
                    };
                    reader.readAsArrayBuffer(params.file);

                } else {
                    //console.log('This bad boy is not a TIFF');
                    var canvas = element.find('canvas');
                    var reader = new FileReader();

                    reader.onload = onLoadFile;
                    reader.readAsDataURL(params.file);

                    function onLoadFile(event) {
                        var img = new Image();
                        img.onload = onLoadImage;
                        img.src = event.target.result;
                    }

                    function onLoadImage() {
                        //console.log(params);
                        var width = params.width || this.width / this.height * params.height;
                        var height = params.height || this.height / this.width * params.width;
                        canvas.attr({ width: width, height: height });
                        canvas[0].getContext('2d').drawImage(this, 0, 0, width, height);
                    }

                }

            }
        };
    }]);