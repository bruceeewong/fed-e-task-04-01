/**
 * 将参数标准化成数组
 * @param value
 * @returns {*|*[]}
 */
function arrified(value) {
  return Array.isArray(value) ? value : [value];
}

export default arrified;
