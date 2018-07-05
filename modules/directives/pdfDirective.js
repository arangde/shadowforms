/**
 *Author : Harish Mistry
 *Created Date : 01 March 2016
 *Usage : this directive is used to define menu template.
 **/

'use strict';
var app = angular.module('Fineform');

app.directive('pdfDirective', ['$route', '$rootScope', '$location', '$window', 'constant', 'restService', 'storageService', 'accessDeniedAlertService', function($route, $rootScope, $location, $window, constant, restService, storageService, accessDeniedAlertService) {
	return {
		restrict: 'A',
		replace: true,
		scope: {
			modal: '=pdfDirective'
		},
		templateUrl: 'views/directives/pdf-directive.html',
		link: function (scope, element, attrs, vm) {
			vm.pageHandler = function(page) {
				document.getElementById('page_number').textContent = page;
			};

			vm.pagesHandler = function(pages) {
				document.getElementById('page_count').textContent = pages;
			};

			var unw = scope.$watch('modal', function(newValue, oldValue, scope) {
				if (newValue.url.length > 0) {
					vm.init(document.getElementById('canvas'), newValue);
					unw();
				}
			}, true);
			
			document.getElementById('previous').addEventListener('click', vm.onPrevPage);
			document.getElementById('next').addEventListener('click', vm.onNextPage);
			document.getElementById('zoomin').addEventListener('click', vm.onZoomIn);
			document.getElementById('zoomfit').addEventListener('click', vm.onZoomFit);
			document.getElementById('zoomout').addEventListener('click', vm.onZoomOut);
			
			$(window).resize(function() {
				var offset = $("#pdf-container").offset();
				if ('top' in offset) {
					var height = ($(window).height() - (offset.top + 60));
					$('#pdf-container').height(height);
				}
			});
			$(window).resize();
		},
		controller: function ($scope) {
			var DEFAULT_SCALE_DELTA = 1.1;
			var DEFAULT_SCALE = 1.0;
			var MIN_SCALE = 1.0;
			var MAX_SCALE = 10.0;
			var vm = this;

			vm.document = undefined;
			vm.fcanvas = undefined;
			vm.canvas = undefined;
			vm.context = undefined;
			vm.pdfDoc = null;
			vm.pageNum = 1;
			vm.pageRendering = false;
			vm.pageNumPending = null;
			vm.scale = 1.0;
			vm.pagesHandler = undefined;
			vm.pageHandler = undefined;
			vm.activeFieldName = '';
			vm.activeFieldDescription = '';
			vm.pen = {
				enabled: false,
				locked: false,
				started: false,
				type: 0,
				x: 0,
				y: 0
			};
			
			vm.init = function (canvas, document) {
				vm.document = document;
				vm.canvas = canvas;
				vm.context = canvas.getContext('2d');
				PDFJS.workerSrc = '//admin.shadowforms.com/libs/pdfjs/build/pdf.worker.js';

				/**
				 * Asynchronously downloads PDF.
				 */
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';
				vm.scale = DEFAULT_SCALE;
				vm.load(vm.document.contents);
				
				var url = vm.document.url.replace(/^(https?|ftp):/, '');
				PDFJS.getDocument(url).then(function (pdfDoc_) {
					vm.pdfDoc = pdfDoc_;
					if (vm.pagesHandler !== undefined) {
						vm.pagesHandler(vm.pdfDoc.numPages);
					}

					// Initial/first page rendering
					vm.renderPage(vm.pageNum);
				});
			};
			
			vm.createElement = function(identity, content, top, left, width, height) {
				var color = '#000000';
				if (content.type === 0) {
					color = '#4285f4';
				} else if (content.type === 1) {
					color = '#9aa19f';
				} else if (content.type === 2) {
					color = '#ea4335';
				} else if (content.type === 3) {
					color = '#fbbc05';
				} else if (content.type === 4) {
					color = '#34a853';
				} else if (content.type === 5) {
					color = '#FF7F00';
				} else if (content.type === 6) {
					color = '#6600ff';
				} else if (content.type === 7) {
					color = '#fd02f4';
				}
				
				var square = new fabric.Rect({
					identity: identity,
					width: width,
					height: height,
					left: left,
					top: top,
					padding: 0,
					fill: color,
					stroke: color,
					borderColor: "#000000",
					cornerColor: "#000000",
					cornerSize: 10,
					strokeWidth: 5,
					lockRotation: true,
					hasRotatingPoint: false,
					lockScalingX: false,
					lockScalingY: false,
					userInfo: content
				});
				
				if (content.type === 5) {
					square['setControlVisible']('tl', true);
					square['setControlVisible']('ml', false);
					square['setControlVisible']('bl', true);
					square['setControlVisible']('mb', false);
					square['setControlVisible']('br', true);
					square['setControlVisible']('mr', false);
					square['setControlVisible']('tr', true);
					square['setControlVisible']('mt', false);
					square['setControlVisible']('mtr', false);
				}

				return square;
			};
			
			vm.duplicateElement = function(elem) {
				var identity = new Date().getTime();
				var content = angular.copy(elem.userInfo);
				content.name = '' + identity;
				if ('id' in content) {
					delete content.id;
				}

				var rect = vm.createElement(identity, content, (elem.top + 25), (elem.left + 25), elem.width, elem.height);
				rect.scaleX = elem.getScaleX();
				rect.scaleY = elem.getScaleY();
				vm.document.contents.push(rect);
				
				vm.fcanvas.deactivateAll();
				vm.fcanvas.add(rect);
				//vm.fcanvas.setActiveObject(rect);
				vm.fcanvas.renderAll();
			};
			
			vm.load = function(contents) {
				var rects = new Array();
				for (var index in contents) {
					var content = contents[index];
					var identity = new Date().getTime();

					var square = vm.createElement(identity, content, 0, 0, 0, 0);
					rects.push(square);
				}
				
				vm.document.contents = rects;
			};

			vm.cancel = function() {
				$location.path('/documents');
			};

			vm.save = function() {
				vm.updateContents(vm.fcanvas);
				var contents = new Array();
				for (var index in vm.document.contents) {
					contents.push(vm.document.contents[index].userInfo);
				}
				
				var documentsURL = constant.apiURL + '/admin/document/' + $route.current.params.id;
				var user_info = storageService.get('user_info');
				
				$rootScope.activityInProgress = true;
				restService.request(documentsURL, 'PATCH', contents, user_info.access_token).then(function (response) {
					$rootScope.activityInProgress = false;
					if ((response.status == 200) && (response.data.response_status)) {
						$location.path('/document');
					}
				}).catch(function (response) {
					$rootScope.activityInProgress = false;
					if (response.status == 401) {
						accessDeniedAlertService.show();
					}
				});
			};

			vm.mousedown = function(object, canvas) {
				if ((vm.pen.enabled) && (canvas.isDrawingMode == false)) {
					if (canvas.getActiveObject() == null) {
						vm.pen.locked = false;
					} else {
						vm.pen.locked = true;
					}

					if (vm.pen.locked == false) {
						var mouse = canvas.getPointer(object.e);
						var identity = new Date().getTime();
						var content = {
							name: identity,
							description: '',
							type: vm.pen.type,
							page_number: vm.pageNum
						};
						
						vm.pen.started = true;
						vm.pen.x = mouse.x;
						vm.pen.y = mouse.y;
						var square = vm.createElement(identity, content, vm.pen.y, vm.pen.x, 20, 20);
						if (vm.pen.type === 5) {
							square.width = 100;
							square.height = 50;
						}

						canvas.add(square);
						canvas.renderAll();
						canvas.setActiveObject(square);
						
						if ((vm.pen.type === 3) || (vm.pen.type === 5)) {
							vm.pen.locked = true;
							vm.pen.enabled = false;
							vm.document.contents.push(square);
						}
					}
				}
			};

			vm.mousemove = function(object, canvas) {
				if ((vm.pen.enabled) && (canvas.isDrawingMode == false)) {
					if (vm.pen.locked == false) {
						if (!vm.pen.started) {
							return false;
						}

						var mouse = canvas.getPointer(object.e);
						var w = Math.abs(mouse.x - vm.pen.x),
							h = Math.abs(mouse.y - vm.pen.y);
						if (!w || !h) {
							return false;
						}

						var square = canvas.getActiveObject();
						if (square) {
							square.set('width', w).set('height', h);
							canvas.renderAll();
						}
					}
				}
			};

			vm.mouseup = function(object, canvas) {
				if ((vm.pen.enabled) && (canvas.isDrawingMode == false)) {
					if (vm.pen.locked == false) {
						if (vm.pen.started) {
							vm.pen.started = false;
						}

						var square = canvas.getActiveObject();
						canvas.getActiveObject().remove();
						canvas.remove(canvas.getActiveObject());
						canvas.add(square);
						canvas.renderAll();
						canvas.setActiveObject(square);
						vm.document.contents.push(square);
						vm.pen.locked = true;
					}

					vm.pen.enabled = false;
				}

				if (canvas.isDrawingMode) {
					vm.pen.enabled = false;
					canvas.isDrawingMode = false;
				}
			};

			vm.shouldShowDrawingPanel = function() {
				if (vm.fcanvas !== undefined) {
					if (vm.fcanvas.getActiveObject() === undefined) {
						return true;
					}

					if (vm.fcanvas.getActiveObject() !== null) {
						return false;
					}
				}
				
				return (vm.pen.enabled === false);
			};

			vm.shouldShowPropertyPanel = function() {
				return (vm.shouldShowDrawingPanel() == false);
			};

			vm.makeTextActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 0;
				vm.pen.enabled = true;
			};

			vm.makePenTextActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 1;
				vm.pen.enabled = true;
			};

			vm.makeFormulaActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 2;
				vm.pen.enabled = true;
			};

			vm.makeMapActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 3;
				vm.pen.enabled = true;
			};

			vm.makeCameraActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 4;
				vm.pen.enabled = true;
			};

			vm.makePenActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 5;
				vm.pen.enabled = true;
			};

			vm.makeCalendarActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 6;
				vm.pen.enabled = true;
			};

			vm.makeNumericActive = function() {
				vm.activeFieldName = '';
				vm.activeFieldDescription = '';

				vm.pen.type = 7;
				vm.pen.enabled = true;
			};

			vm.setActiveFieldInfo = function(object, canvas) {
				if ('userInfo' in canvas.getActiveObject()) {
					vm.pen.type = canvas.getActiveObject().userInfo.type;
					vm.activeFieldName = canvas.getActiveObject().userInfo.name;
					vm.activeFieldDescription = canvas.getActiveObject().userInfo.description;
				}
				
				vm.pen.enabled = true;
			};

			vm.setInActiveFieldInfo = function(object, canvas) {
				if (vm.activeFieldName === undefined) {
					return;
				}
				
				if (vm.activeFieldName.toString().trim().length === 0) {
					return;
				}

				vm.pen.enabled = false;
			};

			vm.applyControlProperty = function() {
				if (vm.activeFieldName !== undefined) {
					if (vm.activeFieldName.toString().trim().length === 0) {
						return;
					}
				}

				if (vm.activeFieldDescription !== undefined) {
					if (vm.activeFieldDescription.toString().trim().length > 0) {
						vm.fcanvas.getActiveObject().userInfo.description = vm.activeFieldDescription.toString().trim();
					}
				}

				vm.fcanvas.getActiveObject().userInfo.name = vm.activeFieldName.toString().trim();
				vm.fcanvas.getActiveObject().userInfo.page_number = vm.pageNum;
				vm.cancelControlProperty();
			};

			vm.cancelControlProperty = function() {
				if (vm.activeFieldName !== undefined) {
					if (vm.activeFieldName.toString().trim().length === 0) {
						vm.fcanvas.remove(vm.fcanvas.getActiveObject());
					}
				}
				
				vm.fcanvas.isDrawingMode = false;
				vm.fcanvas.deactivateAll();
				vm.fcanvas.renderAll();
				vm.pen.enabled = false;
			};
			
			vm.duplicateItem = function() {
				var rect = vm.fcanvas.getActiveObject();
				if (rect !== null) {
					vm.duplicateElement(rect);
				}
			};
			
			vm.deleteItem = function() {
				var rect = vm.fcanvas.getActiveObject();
				if (rect !== null) {
					vm.document.contents = vm.document.contents.filter(function(field) { return (field.identity !== rect.identity); });
					vm.fcanvas.isDrawingMode = false;
					vm.fcanvas.deactivateAll();
					vm.fcanvas.renderAll();
					vm.fcanvas.remove(rect);
					vm.pen.enabled = false;
				}
			};

			vm.downloadPDF = function() {
				vm.fcanvas.isDrawingMode = false;
				vm.pen.enabled = false;

				var link = document.createElement('a');
				link.href = vm.document.url;
				link.target = "__blank";
				link.download = vm.document.name;
				link.dispatchEvent(new MouseEvent('click'));
			};

			vm.updateContents = function(canvas) {
				if (vm.document.contents.length > 0) {
					for (var index in vm.document.contents) {
						if (vm.document.contents[index].userInfo.page_number === vm.pageNum) {
							var sx = vm.document.contents[index].getScaleX();
							var sy = vm.document.contents[index].getScaleY();
							var x = ((vm.document.contents[index].left * 100) / canvas.width);
							var y = ((vm.document.contents[index].top * 100) / canvas.height);
							var w = ((vm.document.contents[index].width * 100) / canvas.width);
							var h = ((vm.document.contents[index].height * 100) / canvas.height);

							// Finally save normal values
							vm.document.contents[index].userInfo.sx = sx.toString();
							vm.document.contents[index].userInfo.sy = sy.toString();
							vm.document.contents[index].userInfo.x = x.toString();
							vm.document.contents[index].userInfo.y = y.toString();
							vm.document.contents[index].userInfo.w = w.toString();
							vm.document.contents[index].userInfo.h = h.toString();
						}
					}
				}
			};

			vm.layoutContents = function (canvas) {
				canvas.clear();
				if (vm.document !== undefined) {
					if ('contents' in vm.document) {
						if (vm.document.contents !== undefined) {
							for (var index in vm.document.contents) {
								var field = vm.document.contents[index];
								if (field.userInfo !== undefined) {
									if (field.userInfo.page_number === vm.pageNum) {
										var sx = parseFloat(field.userInfo.sx);
										var sy = parseFloat(field.userInfo.sy);
										var x = parseFloat(field.userInfo.x);
										var y = parseFloat(field.userInfo.y);
										var w = parseFloat(field.userInfo.w);
										var h = parseFloat(field.userInfo.h);
										
										var scaleX = sx;
										var scaleY = sy;
										var left = ((canvas.width * x) / 100);
										var top = ((canvas.height * y) / 100);
										var width = ((canvas.width * w) / 100);
										var height = ((canvas.height * h) / 100);

										field.scaleX = scaleX;
										field.scaleY = scaleY;
										field.top = top;
										field.left = left;
										field.width = width;
										field.height = height;
										canvas.add(field);
									}
								}
							}
							canvas.renderAll();
							//canvas.calcOffset();
						}
					}
				}
			};

			/**
			 * Get page info from document, resize canvas accordingly, and render page.
			 * @param num Page number.
			 */
			vm.renderPage = function (num) {
				vm.pageRendering = true;

				// Using promise to fetch the page
				vm.pdfDoc.getPage(num).then(function (page) {
					var viewport = page.getViewport(vm.scale);
					vm.canvas.height = viewport.height;
					vm.canvas.width = viewport.width;

					// Render PDF page into canvas context
					var renderContext = {
						canvasContext: vm.context,
						viewport: viewport
					};
					var renderTask = page.render(renderContext);

					// Wait for rendering to finish
					renderTask.promise.then(function () {
						var container = vm.canvas.parentElement;
						var bg = vm.canvas.toDataURL("image/png");
						if (vm.fcanvas === undefined) {
							if (container.clientWidth < viewport.width) {
								vm.fcanvas = new fabric.Canvas('canvas', { selection: false, width: container.clientWidth });
							} else {
								//vm.fcanvas = new fabric.StaticCanvas('canvas', { selection: false });
								vm.fcanvas = new fabric.Canvas('canvas', { selection: false });
							}
							
							vm.fcanvas.isDrawingMode = false;
							vm.fcanvas.on('mouse:down', function (options) {
								vm.mousedown(options, vm.fcanvas);
							});
							
							vm.fcanvas.on('mouse:move', function (options) {
								vm.mousemove(options, vm.fcanvas);
							});

							vm.fcanvas.on('mouse:up', function (options) {
								vm.mouseup(options, vm.fcanvas);
							});

							vm.fcanvas.on('object:selected', function (options) {
								$scope.$apply(function () {
									vm.setActiveFieldInfo(options, vm.fcanvas);
								});
							});
							
							vm.fcanvas.on('selection:cleared', function (options) {
								$scope.$apply(function () {
									vm.setInActiveFieldInfo(options, vm.fcanvas);
								});
							});
						}

						vm.fcanvas.setWidth(viewport.width);
						vm.fcanvas.setHeight(viewport.height);
						vm.fcanvas.setBackgroundImage(bg, vm.fcanvas.renderAll.bind(vm.fcanvas));
						vm.layoutContents(vm.fcanvas);
						
						$(window).resize();
						vm.pageRendering = false;
						if (vm.pageNumPending !== null) {
							// New page rendering is pending
							vm.renderPage(vm.pageNumPending);
							vm.pageNumPending = null;
						}
					});
				});

				// Update page counters
				if (vm.pageHandler !== undefined) {
					vm.pageHandler(vm.pageNum);
				}
			}

			/**
			 * If another page rendering in progress, waits until the rendering is
			 * finised. Otherwise, executes rendering immediately.
			 */
			vm.queueRenderPage = function (num) {
				if (vm.pageRendering) {
					vm.pageNumPending = num;
				} else {
					vm.renderPage(num);
				}
			}

			/**
			 * Displays previous page.
			 */
			vm.onPrevPage = function () {
				if (vm.pageNum <= 1) {
					return;
				}

				vm.updateContents(vm.fcanvas);
				vm.pageNum--;
				vm.queueRenderPage(vm.pageNum);
			}

			/**
			 * Displays next page.
			 */
			vm.onNextPage = function () {
				if (vm.pageNum >= vm.pdfDoc.numPages) {
					return;
				}

				vm.updateContents(vm.fcanvas);
				vm.pageNum++;
				vm.queueRenderPage(vm.pageNum);
			}

			/**
			 * Displays zooming in page.
			 */
			vm.onZoomIn = function () {
				/*
				vm.fcanvas.setZoom(vm.fcanvas.getZoom() * DEFAULT_SCALE_DELTA);
				vm.scale = vm.fcanvas.getZoom();
				vm.queueRenderPage(vm.pageNum);
				*/
				
				var ticks = undefined;
				var newScale = vm.scale;
				do {
					newScale = (newScale * DEFAULT_SCALE_DELTA).toFixed(2);
					newScale = Math.ceil(newScale * 10) / 10;
					newScale = Math.min(MAX_SCALE, newScale);
				} while (--ticks > 0 && newScale < MAX_SCALE);

				if (vm.scale !== newScale) {
					vm.updateContents(vm.fcanvas);
					vm.scale = newScale;
					vm.queueRenderPage(vm.pageNum);
				}
			}

			/**
			 * Displays zoom fit in page.
			 */
			vm.onZoomFit = function () {
				/*
				vm.fcanvas.setZoom(DEFAULT_SCALE);
				vm.scale = vm.fcanvas.getZoom();
				vm.queueRenderPage(vm.pageNum);
				*/
				
				if (vm.scale == 1) {
					return;
				}

				vm.updateContents(vm.fcanvas);
				vm.scale = 1;
				vm.queueRenderPage(vm.pageNum);
			}

			/**
			 * Displays zoom fit in page.
			 */
			vm.onZoomOut = function () {
				/*
				vm.fcanvas.setZoom(vm.fcanvas.getZoom() / DEFAULT_SCALE_DELTA);
				vm.scale = vm.fcanvas.getZoom();
				vm.queueRenderPage(vm.pageNum);
				*/
				
				var ticks = undefined;
				var newScale = vm.scale;
				do {
					newScale = (newScale / DEFAULT_SCALE_DELTA).toFixed(2);
					newScale = Math.floor(newScale * 10) / 10;
					newScale = Math.max(MIN_SCALE, newScale);
				} while (--ticks > 0 && newScale > MIN_SCALE);

				if (vm.scale !== newScale) {
					vm.updateContents(vm.fcanvas);
					vm.scale = newScale;
					vm.queueRenderPage(vm.pageNum);
				}
			}
		},
		controllerAs: 'vm'
	};
}]);
