var left_line = {x: 100},
    right_line = {x: 600},
    top_line = {y: 100},
    bottom_line = {y: 600},
    source_x = 100,
    source_y = 500,
    sacrifice = {
        x: 450,
        y: 400
    },
    pharaoh = {
        x: 300,
        y: 150
    },
    MINIMUM = 100,
    MAXIMUM = 600,
    ACCURACY = 3,
    MAX_REFLECTION = 10,
    __NodeList;

// 寻找给定点(x1, y1)关于某直线(jy-kx-b=0)的对称镜像点
function getMirrorPoint(x1, y1, line_eq) {
    var mirror_point,
        j = line_eq.j,
        k = line_eq.k,
        b = line_eq.b;
    
    if ((j*y1 - k*x1 - b) === 0) {
        console.log("point on give line, mirror point is itself");
        mirror_point = {
            x: x1,
            y: y1
        };
    } else {
        if (j == 0) {
            mirror_point = {
                x: -2*b/k - x1,
                y: y1
            };
        } else {
            mirror_point = {
                x: (j*j*x1 + 2*k*j*y1 - k*k*x1 - 2*k*b)/(j*j + k*k),
                y: (((j*j*x1 + 2*k*j*y1 - k*k*x1 - 2*k*b)/(j*j + k*k) + x1) * k + 2*b - j*y1)/j
            };
        }
    }
    return mirror_point;
}

// 连接两点画线段
function drawLine2p(container,x1,y1,x2,y2) {
    var length = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    var angle  = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    
    var transform = 'rotate('+angle+'deg)';

    var line = __NodeList('<div>')
    .appendTo(container)
    .addClass('line')
    .offset({left: x1, top: y1})
    .width(length)
    .css({
        // 'transform': transform,
        '-webkit-transform': transform,
        'position': 'absolute'
        
    });
    
    //return line;
}

// 给出一点坐标和角度画线段
function drawLinepa(container, x1, y1, angle) {
    var alpha = (angle%360 + 360) % 360,
        line = getLineFuncByPoAn(x1, y1, angle),
        cross_over, xe, ye;
    
    if (alpha <= 90) {
        cross_over = line(right_line);
        if (cross_over <= bottom_line.y) {
            xe = right_line.x;
            ye = cross_over;
        } else {
            ye = bottom_line.y;
            xe = line(bottom_line);
        }
    } else if (alpha <= 180) {
        cross_over = line(left_line);
        if (cross_over <= bottom_line.y) {
            xe = left_line.x;
            ye = cross_over;
        } else {
            ye = bottom_line.y;
            xe = line(bottom_line);
        }
    } else if (alpha <= 270) {
        cross_over = line(left_line);
        if (cross_over >= top_line.y) {
            xe = left_line.x;
            ye = cross_over;
        } else {
            ye = top_line.y;
            xe = line(top_line);
        }
    } else if (alpha < 360) {
        cross_over = line(right_line);
        if (cross_over >= top_line.y) {
            xe = right_line.x;
            ye = cross_over;
        } else {
            ye = top_line.y;
            xe = line(top_line);
        }
    }
        drawLine2p(container, x1, y1, xe, ye);
}

// 
function checkAngle(x1, y1, x2, y2, angle) {
    var distance = getDistance(x1, y1, x2, y2),
        cal_sin_angle = (y2 - y1)/distance,
        sin_angle = Math.sin(Math.PI/180*angle);
    
    if (Math.abs(cal_sin_angle - sin_angle) < 0.0000001) {
        return true;
    } else {
        return false;
    }
}

// 两条直线的交点, 一条直线提供了两个端点(x1,y1)和(x2,y2),另一条直线提供了一个端点(x3,y3)和角度angle
// 交点必须在(x1,y1)和(x2,y2)之间
function getCrossOver2pAp(x1, y1, x2, y2, x3, y3, alpha) {
    var cross_over, k, tg_alpha, _x, _y;
    if (x2 != x1) {
        k = (y2 - y1) / (x2 - x1);
        tg_alpha = Math.tan(Math.PI / 180*alpha);

        if (k === tg_alpha) {
            // skip
        } else {
            _x = (k*x1 - tg_alpha*x3 + y3 - y1)/(k - tg_alpha);
            _y = k*(k*x1 - tg_alpha*x3 + y3 - y1)/(k - tg_alpha) - k*x1 + y1;

            if (_isBetween(x1, x2, _x) && _isBetween(y1, y2, _y) && isInBox(_x, _y) && checkAngle(x3, y3, _x, _y, alpha)) {
                cross_over = {
                    x: _x,
                    y: _y
                };
            }
        }
    } else {
        tg_alpha = Math.tan(Math.PI / 180*alpha);

        _x = x1;
        _y = y3 + (x1-x3)*tg_alpha;


        if (_isBetween(y1, y2, _y) && isInBox(_x, _y) && checkAngle(x3, y3, _x, _y, alpha)) {
            cross_over = {
                x: _x,
                y: _y
            };
        }
    }
    return cross_over;
}

// 两条直线的交点, 一条直线提供了两个端点(x1,y1)和(x2,y2),另一条直线也提供了两个端点(x3,y3)和(x4,y4)
// 交点必须在(x1,y1)和(x2,y2)之间, 内部递归调用时交点在(x3, y3)和(x4, y4)之间
function getCrossOver2p2p(x1,y1,x2,y2,x3,y3,x4,y4, isRec) {
    var cross_over, k, tg_alpha, _x, _y;
    
    if (x4 != x3) {
        if (x2 != x1) {
            k = (y2 - y1)/(x2 - x1);
            tg_alpha = (y4 - y3)/(x4 - x3);
            
            if (k === tg_alpha) {
                // 两条直线平行或者重合
            } else {
                _x = (k*x1 - tg_alpha*x3 + y3 - y1)/(k - tg_alpha);
                _y = k*(k*x1 - tg_alpha*x3 + y3 - y1)/(k - tg_alpha) - k*x1 + y1;

                if (_isBetween(x1, x2, _x) && _isBetween(y1, y2, _y) && isInBox(_x, _y)) {
                    cross_over = {
                        x: _x,
                        y: _y
                    };
                }
            }
        } else {
            tg_alpha = (y4 - y3)/(x4 - x3);

            _x = x1;
            _y = y3 - (x1-x3)*tg_alpha;

            var _y1 = (!!isRec) ? y3 : y1,
                _y2 = (!!isRec) ? y4 : y2;

            if (_isBetween(_y1, _y2, _y) && isInBox(_x, _y)) {
                cross_over = {
                    x: _x,
                    y: _y
                };    
            }
        }
    } else {
        if (x2 != x1) {
            return getCrossOver2p2p(x3,y3,x4,y4,x1,y1,x2,y2, 1);
        } else {
            //两条直线平行或者重合，认为没有交点
        }
    }
    return cross_over;
}

// 获得镜子的旋转角度
function getAngle(id) {
    var target = $(id), matrix, angle;
    
    //transform
    matrix = target.css("-webkit-transform");
    angle = getAngleFromMatrix(matrix);
    
    console.log("angle:"+angle);
    return angle;
}

// 已知两个点，求矢量(x1,y1)到(x2,y2)角度(x轴顺时针)
function getAngleBy2p(x1, y1, x2, y2) {
    var angle;

    if (x1 === x2) {
        angle = 90;
    } else {
        angle = Math.atan((y2-y1)/(x2-x1))*(180/Math.PI);
        if (angle < 0) {
            angle += 180;
        }
    }

    if (y2 > y1) {
        angle += 180;
    } else if ((y2 === y1) && (x2 > x1)) {
        angle = 180;
    }
    return angle;
}

// 从transform矩阵获得旋转角度
function getAngleFromMatrix(matrix) {
    if (matrix !== "none") {
        var values = matrix.split('(')[1];
    
        values = values.split(')')[0];
        values = values.split(',');
        
        var a = values[0],
            b = values[1],
            c = values[2],
            d = values[3]; 
        
        var angle = Math.round(Math.atan2(b, a) * (180/Math.PI));
        return angle;
    }
}

// 通过两点坐标获得直线方程
function getLineFuncBy2Po(x1,y1,x2,y2) {
    if ((x1 == x2) && (y1 == y2)) {
        alert("一个点无法确定一条直线");
        return null;    
    }
    
    return function(point) {
        //直线方程(jy-kx-b=0)
        //{j=?, k=?, b=?}
        var line = {};
        if (x1 == x2) {
            line = {
                j: 0,
                k: 1,
                b: -x1
            };
        } else {
            line = {
                j: 1,
                k: (y2 - y1)/(x2 - x1),
                b: (y1*x2 - x1*y2)/(x2 - x1)
            };    
        }
        if (point && (point.x !== undefined || point.y !== undefined)) {
            if (point.x !== undefined && point.y !== undefined) {
                var distance = Math.abs(line.k*point.x - line.j*point.y + line.b)/Math.sqrt(line.k*line.k + line.j*line.j);
                console.log(distance);
                if (distance < ACCURACY) {
                    console.log("on this line");
                    return true;
                } else {
                    console.log("not on this line");
                    return false;
                }
                //if ((x2-x1)*point.y == ((y1-y2)*point.x + (x1*y2 - y1*x2)/(x1 - x2))){
                // debugger;
                // console.log(Math.abs((x2-x1)*point.y - ((y1-y2)*point.x + (x1*y2 - y1*x2)/(x1 - x2))));
                // if (Math.abs((x2-x1)*point.y - ((y1-y2)*point.x + (x1*y2 - y1*x2)/(x1 - x2))) < 0.00001) {
                //     console.log("on this line");
                //     return true;
                // } else {
                //     console.log("not on this line");
                //     return false;
                // }
            } else if (point.x === undefined) {
                // return value of x
                if (y1 != y2) {
                    return (x1 - x2)*point.y/(y1-y2) + (y1*x2-y2*x1)/(y1-y2);
                } else {
                    console.log("unable to determine value of x");
                    return null;
                }
            } else if (point.y === undefined) {
                // return value of y;
                if (x1 != x2) {
                    return (y1 - y2)*point.x/(x1 - x2) + (x1*y2 - y1*x2)/(x1 - x2);
                } else {
                    console.log("unable to determine value of y");
                    return null;
                }
            }
        } else {
            return line;
        }
        
    };     
}

// 通过一个坐标点和角度获得直线方程
function getLineFuncByPoAn(x1, y1, angle) {
    var alpha = ((angle%360) + 360) % 360,
        tg_alpha = Math.tan(Math.PI/180*alpha);
    
    return function(point) {
        //直线方程(jy-kx-b=0)
        //{j=?, k=?, b=?}
        var line = {};
        if (alpha == 90 || alpha == 270) {
            line = {
                j: 0,
                k: -1,
                b: x1
            };    
        } else {
            line = {
                j: 1,
                k: tg_alpha,
                b: y1-tg_alpha*x1
            };
        }

        if (point && (point.x !== undefined || point.y !== undefined)) {
            
            if (point.x !== undefined && point.y !== undefined) {    
                var distance = Math.abs(line.k*point.x - line.j*point.y + line.b)/Math.sqrt(line.k*line.k + line.j*line.j);
                console.log(distance);
                if (distance < ACCURACY) {
                    console.log("on this line");
                    return true;
                } else {
                    console.log("not on this line");
                    return false;
                }
            } else if (point.x === undefined) {
                // return value of x
                return (point.y - y1)/tg_alpha + x1;
            } else if (point.y === undefined) {
                // return value of y;
                return tg_alpha*(point.x - x1) + y1;
            }
        } else {
            return line;
        };
    };
}

// 两点之间距离
function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
}

// 判断点(x1, y1)是否box内
function isInBox(x1, y1) {
    if ((x1 >= MINIMUM && x1 <= MAXIMUM) && (y1 >= MINIMUM && y1 <= MAXIMUM)) {
        return true;
    } else {
        return false;
    }
}

// 判断target值是否在refA和refB之间
function _isBetween(refA, refB, target) {
    if ((refA <= target && target <= refB) || (refA >= target && target >= refB)) {
        return true;
    } else {
        return false;
    }
}