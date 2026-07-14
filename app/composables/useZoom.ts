import { ref, onBeforeUnmount, type Ref } from 'vue';
import * as d3 from 'd3';

export const useZoom = (
  svgRef: Ref<SVGSVGElement | null>,
  contentRef: Ref<SVGGElement | null>,
) => {
  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);
  const zoomBehavior = ref<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const init = () => {
    if (!svgRef.value || !contentRef.value) return;

    const svg = d3.select(svgRef.value);
    const content = d3.select(contentRef.value);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event: d3.D3ZoomEvent<SVGSVGElement, unknown>) => {
        const { x, y, k } = event.transform;
        translateX.value = x;
        translateY.value = y;
        scale.value = k;
        content.attr('transform', `translate(${x},${y}) scale(${k})`);
      });

    zoomBehavior.value = zoom;
    svg.call(zoom);

    const { clientWidth, clientHeight } = svgRef.value;
    const initialTransform = d3.zoomIdentity
      .translate(clientWidth / 2, clientHeight / 2)
      .scale(0.6);
    svg.call(zoom.transform, initialTransform);
  };

  const reset = () => {
    if (!svgRef.value || !zoomBehavior.value) return;
    const svg = d3.select(svgRef.value);
    const { clientWidth, clientHeight } = svgRef.value;
    svg
      .transition()
      .duration(500)
      .call(
        zoomBehavior.value.transform,
        d3.zoomIdentity.translate(clientWidth / 2, clientHeight / 2).scale(0.6),
      );
  };

  onBeforeUnmount(() => {
    if (svgRef.value) {
      d3.select(svgRef.value).on('.zoom', null);
    }
  });

  return { scale, translateX, translateY, init, reset, zoomBehavior };
};