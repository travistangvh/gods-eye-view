- Add Singapore LTA traffic cameras as a keyless CCTV source pack from the
  data.gov.sg Traffic Images API, with frames pinned to
  `images.data.gov.sg/api/traffic-images/`. The feed publishes 8 cameras today
  (Woodlands Causeway, Tuas and the southern coast); LTA DataMall would be the
  route to the full network. `CCTV_SG_ENABLED=0` turns the pack off and
  `CCTV_SG_MAX_SOURCES` sets the cap.
