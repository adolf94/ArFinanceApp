from azure.core.credentials import AzureKeyCredential
from azure.identity import DefaultAzureCredential
from azure.ai.vision.imageanalysis import ImageAnalysisClient
from azure.ai.vision.imageanalysis.models import VisualFeatures
import io
import re
from pathlib import Path
import os

 

SERVICE_ENDPOINT = os.environ.get("AZ_IMG_ENDPOINT")
CREDENTIAL = DefaultAzureCredential() if  os.environ.get("AZ_IMAGE_KEY") == None else AzureKeyCredential(os.environ.get("AZ_IMAGE_KEY"))
# CREDENTIAL = AzureKeyCredential(os.environ(["AZ_IMAGE_KEY"]))

# Initialize Image Analysis client
client = ImageAnalysisClient(SERVICE_ENDPOINT, CREDENTIAL)



def extract_from_ia(image_path):
    
    with open(image_path, "rb") as image_stream:
        image_bytes = image_stream.read()
        image_data = io.BytesIO(image_bytes)

    # Call the OCR API using image data
    result = client.analyze(
        image_data=image_data,
        visual_features=[VisualFeatures.READ]
    )
    full_text = ""
    output = []
    lines = []
    if result.read is not None:

        for read_result in result.read.blocks:
        # for read_result in result.read.blocks:
            for line in read_result.lines:
                lines.append(line.text)
                output.append({
                    "text": line.text,
                    "bounds": [
                        line.bounding_polygon[0].as_dict(),
                        line.bounding_polygon[1].as_dict(),
                        line.bounding_polygon[2].as_dict(),
                        line.bounding_polygon[3].as_dict(),
                    ]
                })
                full_text += line.text + "\n"
    
    return {
        "action":"img_upload",
        "lines":lines,
        "data": output
    }
