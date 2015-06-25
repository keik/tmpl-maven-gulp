/** configuration */

module.exports = {

  /** path */
  path: {

    /** frontend resources path */
    src: 'src/main/webapp',

    /** built-frontend resouces path */
    dest: 'target/dist',

    /** relative templates path from webapp **/
    templates: 'WEB-INF/templates',

    /** relative resources path from webapp **/
    resources: 'resources'
  },

  timeStamp: Date.now()
};
