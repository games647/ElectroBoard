#!/usr/bin/python3
from pysimplesoap.client import SoapClient

# Install the above dependency with "pip install pysimplesoap"

location = 'http://fritz.box:49000/igdupnp/control/WANCommonIFC1'
namespace = 'urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1'
action = 'urn:schemas-upnp-org:service:WANCommonInterfaceConfig:1#'

debug = False  # display http/soap requests and responses

client = SoapClient(location, action, namespace, trace=debug)

response2 = client.GetAddonInfos()
newbytesendrate = int(response2.GetAddonInfosResponse.NewByteSendRate)
newbytereceiverate = int(response2.GetAddonInfosResponse.NewByteReceiveRate)

print(newbytesendrate, newbytereceiverate)